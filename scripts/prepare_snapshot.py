"""Prepare reviewed Carbon Mapper imagery for the frozen Plume demonstration."""
from pathlib import Path
import hashlib
import json
import os
os.environ.setdefault('MPLCONFIGDIR', '/private/tmp/plume-mplconfig')
import matplotlib
import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling, transform_bounds
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'research/preflight-2026-09-19'
OUT = ROOT / 'public/data/plume-2026-09-19'
OUT.mkdir(parents=True, exist_ok=True)
observations = []
files = []
names = ['emi20240420t101448p07050-A', 'emi20241023t083741p06026-A']
us_names = ['emi20240803t190415p13004-C','emi20240807t172838p12003-A','emi20240926t213956p14002-A']
for name in names + us_names:
    SOURCE = ROOT / ('research/preflight-2026-09-19' if name in names else 'research/us-2026-09-19')
    case_id = 'yemen-area' if name in names else 'newby-island'
    scale_max = 5500 if name in names else 9000
    record = json.loads((SOURCE / f'{name}.json').read_text())['items'][0]
    with rasterio.open(SOURCE / f'{name}_plume-concentrations.tif') as src:
        transform, width, height = calculate_default_transform(src.crs, 'EPSG:3857', src.width, src.height, *src.bounds)
        values = np.full((height, width), np.nan, dtype='float32')
        reproject(src.read(1), values, src_transform=src.transform, src_crs=src.crs, src_nodata=src.nodata,
                  dst_transform=transform, dst_crs='EPSG:3857', dst_nodata=np.nan, resampling=Resampling.nearest)
        rgba = (matplotlib.colormaps['cividis'](np.nan_to_num(values / scale_max, nan=0).clip(0, 1)) * 255).astype('uint8')
        rgba[:, :, 3] = np.where(np.isfinite(values), 255, 0)
        Image.fromarray(rgba).save(OUT / f'{name}.png')
        b = rasterio.transform.array_bounds(height, width, transform)
        west, south, east, north = transform_bounds('EPSG:3857', 'EPSG:4326', *b)
        original = src.read(1, masked=True)
        asset = {'url':f'/data/plume-2026-09-19/{name}.png','bounds':[west,south,east,north],
                 'coordinates':[[west,north],[east,north],[east,south],[west,south]],
                 'crs':'EPSG:3857','nativeCrs':str(src.crs),'resampling':'nearest','scale':[0,scale_max],
                 'unit':'ppm·m','quantity':'Methane column enhancement','max':float(original.max()),
                 'nodata':'NaN','validZeroCount':int((original.compressed()==0).sum())}
    outline = json.loads((SOURCE / f'{name}_plume-outline.geojson').read_text())
    stac_url = f'https://api.carbonmapper.org/api/v1/stac/collections/l3a-vis-ch4-mfa-v3/items/{name}'
    observations.append({'id':name,'caseId':case_id,'acquisitionId':record['scene_id'],
        'date':record['scene_timestamp'],'provider':'Carbon Mapper','instrument':'EMIT',
        'location':record['geometry_json']['coordinates'],'locationRole':'Provider plume-origin estimate',
        'rate':None if record['hide_emission'] else record['emission_auto'],
        'uncertainty':None if record['hide_emission'] else record['emission_uncertainty_auto'],
        'uncertaintyDefinition':'Provider-reported uncertainty; interval definition not established in this snapshot',
        'rateStatus':'suppressed' if record['hide_emission'] else 'published',
        'rateUnit':'kg/h','rateKind':'instantaneous_plume_rate','quality':record['plume_quality'],
        'processing':record['processing_software'],'sourceUrl':stac_url,'asset':asset,'outline':outline})
    for file in [OUT / f'{name}.png']:
        files.append({'path':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'role':'scientific-raster',
                      'sourceRecord':name,'license':'Carbon Mapper terms, 2026-01-13; noncommercial, attribution, same downstream terms'})

SOURCE = ROOT / 'research/preflight-2026-09-19'
products = json.loads((SOURCE/'carbon-stac-april-search.json').read_text())['features']
lineage = [{'id':f['collection']+'/'+f['id'],'observationId':names[0], 'collection':f['collection'],
            'role':('Rate estimate' if 'l4a' in f['collection'] else 'Enhancement imagery' if 'vis' in f['collection'] else 'Mass quantification' if 'ime' in f['collection'] else 'Plume metadata'),
            'sourceUrl':f"https://api.carbonmapper.org/api/v1/stac/collections/{f['collection']}/items/{f['id']}",
            'relationship':'same_plume_product_family','status':'verified'} for f in products]
gradient=(matplotlib.colormaps['cividis'](np.linspace(0,1,256))[None,:,:]*255).astype('uint8')
Image.fromarray(gradient).resize((256,8),resample=Image.Resampling.NEAREST).save(OUT/'cividis.png')
files.append({'path':'cividis.png','sha256':hashlib.sha256((OUT/'cividis.png').read_bytes()).hexdigest(),'role':'scientific-legend','sourceRecord':'Matplotlib cividis','license':'Matplotlib license; cividis color map'})
snapshot = {'id':'plume-2026-09-19','schemaVersion':'1.0','rulesVersion':'1.0','retrievedAt':'2026-09-19',
    'attribution':'Source: Carbon Mapper','termsUrl':'https://carbonmapper.org/terms',
    'cases':[{'id':'yemen-area','title':'A plume across two dates','place':'Marib region, Yemen','country':'Yemen',
       'subtitle':'Two satellite observations. One unanswered source question.', 'location':[46.036,15.586],
       'scope':'Geographic area; shared source not established','observationIds':names,
       'description':'Two EMIT acquisitions record methane enhancement near 46.036° E, 15.586° N. Their nearby origins do not establish the same emitting facility.',
       'attributionStatus':'Unresolved','featured':True}],
    'observations':observations,'relationships':lineage,'files':files,
    'limitations':['Curated historical observations, not live monitoring.','Gaps do not establish absence of methane.','No facility attribution is established for this area.']}
snapshot['cases'].append({'id':'newby-island','title':'Three moments, a different annual measure','place':'Newby Island, California','country':'United States','subtitle':'A real reporting record. A comparison we cannot justify.','location':[-121.94164,37.45973],'scope':'Geographic area; registry proximity is not confirmed source attribution','observationIds':us_names,'description':'Three EMIT acquisitions near Newby Island accompany a published EPA annual reporting record. They cannot establish an annual discrepancy.','attributionStatus':'Unresolved','featured':False,
 'facilities':[{'id':'EPA-1006179','name':'Newby Island Landfill','location':[-121.94164,37.45973],'role':'EPA GHGRP facility registry point; FRS 110006533117','sourceUrl':'https://www.epa.gov/system/files/other-files/2024-10/2023_data_summary_spreadsheets.zip','relationship':'Nearby reported facility; attribution not verified'}],
 'inventory':{'id':'EPA-1006179-HH-2023','facility':'Newby Island Landfill','year':2023,'value':7954.5,'unit':'metric tonnes CH₄','gas':'Methane','sourceUrl':'https://data.epa.gov/dmapservice/ghg.hh_subpart_level_information/facility_id/equals/1006179/and/reporting_year/equals/2023/json','field':'ghg_quantity','boundary':'Reported Subpart HH landfill methane emissions; not a satellite plume footprint','method':'EPA GHGRP Subpart HH annual reporting. The specific selected facility equation is not reviewed here'}})
snapshot['cases'][1]['attributionContext']='The official permit lists landfill waste decomposition (S-2) and composting (S-3) at this site. The selected observations and registry point do not establish which process emitted the methane. Process locations and operational boundaries have not been reconciled; no uncertainty radius or separate component points are invented.'
snapshot['cases'][1]['contextSource']='https://www.baaqmd.gov/~/media/files/engineering/title-v-permits/a9013-a5472old/a9013_11_2022_aa_final_permit_signed-pdf.pdf'
(OUT/'snapshot.json').write_text(json.dumps(snapshot,indent=2)+'\n')
(OUT/'ATTRIBUTION.txt').write_text('Source: Carbon Mapper\nData and derived imagery are distributed under Carbon Mapper Terms of Use, effective January 13, 2026.\nNoncommercial use, attribution, and the same downstream conditions apply. Data are not MIT licensed.\nhttps://carbonmapper.org/terms\nPlume is an independent project and is not endorsed by Carbon Mapper.\n')
print(f'Prepared {len(observations)} real observations and {len(lineage)} product relationships in {OUT}')
