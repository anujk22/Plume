"""Prepare traceable sensor pixels and labeled contour bands from numeric methane imagery."""
from pathlib import Path
import hashlib,json,sys
import numpy as np
import contourpy
from matplotlib import colormaps,colors
import rasterio
from rasterio.warp import calculate_default_transform,reproject,Resampling,transform_bounds,transform as transform_points
from rasterio.windows import Window
from PIL import Image
from io import BytesIO
root=Path(__file__).resolve().parents[1]
investigations='--investigations' in sys.argv
folder='investigation-plumes' if investigations else 'santiago-plumes'
output=root/'public/data'/folder
snapshot=json.loads((root/'public/data/plume-2026-09-19/snapshot.json').read_text())
observations={o['id']:o for o in snapshot['observations']}
check='--check' in sys.argv
palette=(colormaps['inferno'](np.linspace(0,1,256))*255).astype('uint8')
paths=sorted((root/'research').glob('*/*_con_tif.tif')) if investigations else sorted((root/'research/santiago').glob('*.tif'))
maximum=0
for path in paths:
 with rasterio.open(path) as src: maximum=max(maximum,float(src.read(1,masked=True).max()))
# One shared, explicit scale covers every valid sample in these three acquisitions.
maximum=int(np.ceil(maximum/500)*500)
manifest={}
for path in paths:
 name=path.stem.removesuffix('_con_tif')
 if investigations:maximum=observations[name]['asset']['scale'][1]
 with rasterio.open(path) as src:
  raw=src.read(1,masked=True)
  valid=~np.ma.getmaskarray(raw)&np.isfinite(raw.data)
  y,x=np.where(valid)
  window=Window(int(x.min()),int(y.min()),int(x.max()-x.min()+1),int(y.max()-y.min()+1))
  values=src.read(1,window=window,masked=True).filled(np.nan)
  bounds=rasterio.windows.bounds(window,src.transform)
  transform,width,height=calculate_default_transform(src.crs,'EPSG:3857',values.shape[1],values.shape[0],*bounds)
  dest=np.full((height,width),np.nan,dtype='float32')
  reproject(values,dest,src_transform=src.window_transform(window),src_crs=src.crs,src_nodata=np.nan,dst_transform=transform,dst_crs='EPSG:3857',dst_nodata=np.nan,resampling=Resampling.nearest)
  assert np.isin(dest[np.isfinite(dest)],raw.compressed()).all()
  assert raw.min()>=0 and raw.max()<=maximum
  indices=np.minimum((np.nan_to_num(dest,nan=0)/maximum*256).astype(int),255)
  rgba=palette[indices].copy();rgba[:,:,3]=np.where(np.isfinite(dest),255,0)
  png=BytesIO();Image.fromarray(rgba).save(png,format='PNG');data=png.getvalue()
  if check:data=(output/(name+'.png')).read_bytes()
  west,south,east,north=transform_bounds('EPSG:3857','EPSG:4326',*rasterio.transform.array_bounds(height,width,transform))
  metadata={'sourceUrl':json.loads((path.parent/(name+'.json')).read_text())['items'][0]['con_tif'].split('?')[0],'recordUrl':observations[name]['sourceUrl']} if investigations else json.loads(path.with_suffix('.json').read_text())
  levels=np.linspace(0,maximum,65)
  generator=contourpy.contour_generator(z=np.ma.masked_invalid(dest),corner_mask=investigations,fill_type='OuterOffset',z_interp='Linear')
  features=[];svg_paths=[]
  for lower,upper in zip(levels[:-1],levels[1:]):
   color=colors.to_hex(colormaps['inferno']((lower+upper)/(2*maximum)))
   polygons,offsets=generator.filled(float(lower),float(upper))
   for polygon,offset in zip(polygons,offsets):
    rings=[];commands=[]
    for start,end in zip(offset[:-1],offset[1:]):
     ring=polygon[start:end]
     # Contours use valid measured corners only; masked vertices never contribute.
     assert all(0<=point[0]<=width-1 and 0<=point[1]<=height-1 for point in ring)
     xy=[transform*(float(x)+.5,float(y)+.5) for x,y in ring]
     lon,lat=transform_points('EPSG:3857','EPSG:4326',[v[0] for v in xy],[v[1] for v in xy])
     rings.append([[round(x,9),round(y,9)] for x,y in zip(lon,lat)])
     commands.append('M'+' L'.join(f'{x+.5:.3f},{y+.5:.3f}' for x,y in ring)+' Z')
    features.append({'type':'Feature','properties':{'lower':float(lower),'upper':float(upper),'color':color},'geometry':{'type':'Polygon','coordinates':rings}})
    svg_paths.append(f'<path fill="{color}" fill-rule="evenodd" d="{" ".join(commands)}"/>')
  contours=json.dumps({'type':'FeatureCollection','features':features},separators=(',',':'))+'\n'
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" shape-rendering="crispEdges">'+''.join(svg_paths)+'</svg>\n'
  for suffix,body in [('.geojson',contours),('.svg',svg)]:
   target=output/(name+suffix)
   if check:assert target.read_text()==body
   else:output.mkdir(exist_ok=True);target.write_text(body)

  manifest[name]={'url':f'/data/{folder}/{name}.png','contoursUrl':f'/data/{folder}/{name}.geojson','previewUrl':f'/data/{folder}/{name}.svg','palette':'inferno','contoursSha256':hashlib.sha256(contours.encode()).hexdigest(),'contourMethod':f'ContourPy linear interpolation within {"valid measured triangles" if investigations else "fully valid cells"}; 64 bands on the fixed 0–{maximum:g} ppm·m scale; no spatial smoothing or nodata infilling','coordinates':[[west,north],[east,north],[east,south],[west,south]],'bounds':[west,south,east,north],'scale':[0,maximum],'unit':'ppm·m','quantity':'Methane column enhancement','sourceUrl':metadata['sourceUrl'],'recordUrl':metadata['recordUrl'],'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sha256':hashlib.sha256(data).hexdigest(),'resampling':'nearest','mask':'Provider nodata mask; transparent areas are not measured zeros','nativeSamples':int(valid.sum())}
  if check:np.testing.assert_array_equal(np.asarray(Image.open(output/(name+'.png'))),rgba)
  else:output.mkdir(exist_ok=True);(output/(name+'.png')).write_bytes(data)
if check:
 recorded=json.loads((output/'manifest.json').read_text())
 assert recorded.keys()==manifest.keys()
 for name,asset in manifest.items():
  for key in ['coordinates','bounds']:
   np.testing.assert_allclose(recorded[name][key],asset[key],rtol=0,atol=1e-9)
   asset[key]=recorded[name][key]
  assert recorded[name]==asset
else:(output/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(manifest)} verified plumes; published case scales preserved' if investigations else f'{len(manifest)} verified plumes, shared scale 0–{maximum} ppm·m')
