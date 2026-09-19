"""Validate the exact frozen scientific assets, lineage, and export boundary."""
from pathlib import Path
import json,hashlib
import numpy as np
import rasterio
from rasterio.warp import reproject,Resampling
from PIL import Image
root=Path(__file__).resolve().parents[1];out=root/'public/data/plume-2026-09-19'
s=json.loads((out/'snapshot.json').read_text());results=[]
for o in s['observations']:
 source=root/('research/preflight-2026-09-19' if o['caseId']=='yemen-area' else 'research/us-2026-09-19')
 n=o['id'];raw=json.loads((source/f'{n}.json').read_text())['items'][0]
 assert raw['scene_timestamp']==o['date'] and raw['scene_id']==o['acquisitionId']
 assert o['rate']==(None if raw['hide_emission'] else raw['emission_auto'])
 with rasterio.open(source/f'{n}_plume-concentrations.tif') as vis,rasterio.open(source/f'{n}_con_tif.tif') as crop:
  assert vis.crs==crop.crs and np.isnan(vis.nodata) and crop.nodata==0
  a=vis.read(1,masked=True);q=crop.read(1,masked=True);valid=~np.ma.getmaskarray(q);aligned=np.full(q.shape,np.nan,dtype='float32')
  reproject(vis.read(1),aligned,src_transform=vis.transform,src_crs=vis.crs,src_nodata=vis.nodata,dst_transform=crop.transform,dst_crs=crop.crs,dst_nodata=np.nan,resampling=Resampling.nearest)
  np.testing.assert_array_equal(aligned[valid],q.data[valid]);assert float(a.max())<=o['asset']['scale'][1]
  rgba=np.asarray(Image.open(out/f'{n}.png'));assert (rgba[:,:,3]==0).any() and (rgba[:,:,3]==255).any()
  results.append({'record':n,'native_crs':str(vis.crs),'matching_quantification_samples':int(valid.sum()),'max_ppm_m':float(a.max()),'valid_zero_samples':int((a.compressed()==0).sum())})
for f in s['files']:assert hashlib.sha256((out/f['path']).read_bytes()).hexdigest()==f['sha256']
assert len({r['observationId'] for r in s['relationships']})==1 and len(s['relationships'])==7
assert not any('synthetic' in str(o).lower() or '/art/' in str(o) for o in s['observations'])
report={'snapshot':s['id'],'cases':len(s['cases']),'observations':len(s['observations']),'rasters':results,'file_hashes_verified':len(s['files'])}
(root/'research/release-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
