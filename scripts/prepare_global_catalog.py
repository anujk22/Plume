"""Prepare NASA's complete saved public plume feed without double-counting point/polygon pairs."""
import hashlib
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = root / 'research/preflight-2026-09-19/nasa-public-plumes.json'
raw = json.loads(source.read_text())
paired = {}
for feature in raw['features']:
    p = feature['properties']
    record = paired.setdefault(p['Plume ID'], {})
    kind = feature['geometry']['type']
    assert kind not in record, f'Duplicate {kind} for {p["Plume ID"]}'
    record[kind] = feature
points, outlines = [], []
for identifier, pair in sorted(paired.items()):
    assert set(pair) == {'Point', 'Polygon'}
    p = pair['Point']['properties']
    q = pair['Polygon']['properties']
    for field in ['UTC Time Observed', 'Scene FIDs', 'Max Plume Concentration (ppm m)']:
        assert p[field] == q[field]
    location = pair['Point']['geometry']['coordinates'][:2]
    assert -180 <= location[0] <= 180 and -90 <= location[1] <= 90
    props = dict(id=identifier, date=p['UTC Time Observed'], scenes=', '.join(p['Scene FIDs']),
                 peak=p['Max Plume Concentration (ppm m)'], download=p['Data Download'])
    assert isinstance(props['peak'], (int, float)) and props['peak'] >= 0
    assert props['download'].startswith('https://data.lpdaac.earthdatacloud.nasa.gov/')
    points.append(dict(type='Feature', properties=props, geometry=dict(type='Point', coordinates=location)))
    outlines.append(dict(type='Feature', properties={'id':identifier}, geometry=pair['Polygon']['geometry']))
output = root / 'public/data/global-methane'
output.mkdir(exist_ok=True)
files = {'points.geojson':dict(type='FeatureCollection', features=points),
         'outlines.geojson':dict(type='FeatureCollection', features=outlines)}
manifest = dict(provider='NASA/JPL EMIT', count=len(points), checkedOn='2026-09-19',
    start=min(p['properties']['date'] for p in points), end=max(p['properties']['date'] for p in points),
    sourceUrl='https://earth.jpl.nasa.gov/emit-mmgis/Missions/EMIT/Layers/coverage/combined_plume_metadata.json',
    sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
    locationMeaning='Maximum column-enhancement pixel; not a source-origin estimate.',
    selectionRule='All plume IDs in the saved NASA methane feed. Point and polygon representations counted once.',
    limitations='Historical published detections, not global continuous coverage. Catalog context is separate from Carbon Mapper case evidence; cross-provider records are not added as independent corroboration.', files={})
for name, value in files.items():
    body=json.dumps(value,separators=(',',':'))+'\n'
    manifest['files'][name]=hashlib.sha256(body.encode()).hexdigest()
    if '--check' in sys.argv: assert (output/name).read_text()==body
    else: (output/name).write_text(body)
body=json.dumps(manifest,indent=2)+'\n'
if '--check' in sys.argv: assert (output/'manifest.json').read_text()==body
else: (output/'manifest.json').write_text(body)
print(f'{len(points)} unique NASA plumes verified; point/polygon pairs counted once')
