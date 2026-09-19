"""Render provider-masked enhancement for the homepage, without smoothing or thresholding."""
from pathlib import Path
import hashlib,json,sys
import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform,reproject,Resampling,transform_bounds
from rasterio.windows import Window
from PIL import Image
from io import BytesIO
root=Path(__file__).resolve().parents[1]
source=root/'research/us-2026-09-19'
out=root/'public/data/home-plumes'
check='--check' in sys.argv
palette=np.asarray(Image.open(root/'public/data/plume-2026-09-19/cividis.png'))[0]
manifest={}
for path in sorted(source.glob('*_con_tif.tif')):
 name=path.name.removesuffix('_con_tif.tif')
 with rasterio.open(path) as src:
  raw=src.read(1,masked=True)
  assert src.nodata==0 and raw.count()>0
  # Crop only the provider's nodata margin; every unmasked sample is retained.
  y,x=np.where(~np.ma.getmaskarray(raw))
  window=Window(int(x.min()),int(y.min()),int(x.max()-x.min()+1),int(y.max()-y.min()+1))
  values=src.read(1,window=window)
  native_transform=src.window_transform(window)
  bounds=rasterio.windows.bounds(window,src.transform)
  transform,width,height=calculate_default_transform(src.crs,'EPSG:3857',values.shape[1],values.shape[0],*bounds)
  dest=np.full((height,width),np.nan,dtype='float32')
  reproject(values,dest,src_transform=native_transform,src_crs=src.crs,src_nodata=0,dst_transform=transform,dst_crs='EPSG:3857',dst_nodata=np.nan,resampling=Resampling.nearest)
  # A display pixel must be an existing provider sample, never an interpolation.
  assert np.isin(dest[np.isfinite(dest)],raw.compressed()).all()
  indices=np.minimum((np.nan_to_num(dest,nan=0).clip(0,9000)/9000*256).astype(int),255)
  rgba=palette[indices].copy();rgba[:,:,3]=np.where(np.isfinite(dest),255,0)
  data=BytesIO();Image.fromarray(rgba).save(data,format='PNG');png=data.getvalue()
  if check:
   np.testing.assert_array_equal(np.asarray(Image.open(out/f'{name}.png')),rgba)
   png=(out/f'{name}.png').read_bytes()
  west,south,east,north=transform_bounds('EPSG:3857','EPSG:4326',*rasterio.transform.array_bounds(height,width,transform))
  catalog=json.loads((source/f'{name}_search.json').read_text())
  product=next(f for f in catalog['features'] if f['collection']=='l3a-ime-ch4-mfa-v3')
  asset=product['assets']['ime-cmf-concentrations.tif']
  manifest[name]={'url':f'/data/home-plumes/{name}.png','coordinates':[[west,north],[east,north],[east,south],[west,south]],'bounds':[west,south,east,north],'unit':'ppm·m','scale':[0,9000],'sourceUrl':asset['href'],'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sha256':hashlib.sha256(png).hexdigest(),'nativeSamples':int(raw.count()),'resampling':'nearest','mask':'Provider nodata mask; transparent areas are not measured zeros'}
  if not check:out.mkdir(parents=True,exist_ok=True);(out/f'{name}.png').write_bytes(png)
body=json.dumps(manifest,indent=2)+'\n'
if check:
 recorded=json.loads((out/'manifest.json').read_text())
 assert recorded.keys()==manifest.keys()
 for name,asset in manifest.items():
  for key in ['coordinates','bounds']:
   np.testing.assert_allclose(recorded[name][key],asset[key],rtol=0,atol=1e-9)
   asset[key]=recorded[name][key]
  assert recorded[name]==asset,'Homepage provenance differs from source'
else:(out/'manifest.json').write_text(body)
print(f'{"Verified" if check else "Prepared"} {len(manifest)} provider-masked plume previews.')
