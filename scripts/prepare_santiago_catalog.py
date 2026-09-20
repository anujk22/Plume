"""Freeze published Santiago CH4 plume footprints; never treat scene coverage as detections."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://api.carbonmapper.org/api/v1/stac/search?bbox=-71.3,-34,-70.1,-32.6&limit=100'
parser = argparse.ArgumentParser()
parser.add_argument('--input', help='Previously retrieved complete STAC page array')
args = parser.parse_args()
if args.input:
    pages = json.loads(Path(args.input).read_text())
else:
    pages = []
    offset = 0
    while True:
        with urllib.request.urlopen(URL + '&offset=' + str(offset), timeout=45) as response:
            page = json.load(response)
        pages.append(page)
        offset += len(page['features'])
        if offset >= page['numberMatched']:
            break
        assert page['features'], 'Incomplete catalog response'
features = [feature for page in pages for feature in page['features']]
assert len(features) == pages[0]['numberMatched'], 'Incomplete catalog pagination'
# Multiple processing versions of one named plume are one record, not corroboration.
selected = {}
for feature in features:
    p = feature['properties']
    if not feature['collection'].startswith('l3a-vis-ch4-') or p.get('cm:visibility') != 'public':
        continue
    key = feature['id']
    rank = (p.get('processing:datetime', p.get('created', '')), feature['collection'])
    if key not in selected or rank > selected[key][0]:
        selected[key] = (rank, feature)
records = []
for _, f in selected.values():
    p = f['properties']
    records.append(dict(id=f['id'], date=p['datetime'], acquisitionId=p['cm:scene_id'],
        instrument={'ang': 'AVIRIS-NG', 'tan': 'Tanager-1', 'emit': 'EMIT'}[p['instruments'][0]],
        location=[p['cm:plume_longitude'], p['cm:plume_latitude']],
        sourceUrl=next(link['href'] for link in f['links'] if link['rel'] == 'self'),
        outline={'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {}, 'geometry': f['geometry']}]}))
records.sort(key=lambda r: (r['date'], r['id']), reverse=True)
output = dict(id='santiago-catalog-2026-09-19', retrievedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    bbox=[-71.3, -34, -70.1, -32.6], provider='Carbon Mapper', termsUrl='https://carbonmapper.org/terms',
    attribution='Source: Carbon Mapper', sourceUrl=URL, sourceProductCount=len(features),
    rawResponseSha256=hashlib.sha256(json.dumps(pages, sort_keys=True).encode()).hexdigest(),
    selectionRule='Public CH4 L3 plume visualization records, latest processing timestamp per exact plume ID. Scene products excluded. Distinct plumes may share an acquisition.',
    limitations=['Regional catalog excerpt, not global coverage.', 'Locations and footprints are provider estimates, not exposure or confirmed facility attribution.', 'No concentration raster or emission-rate estimate is included in this catalog excerpt.', 'Catalog records are separate from reviewed investigation evidence and exports.'],
    observations=records)
path = ROOT / 'public/data/santiago-catalog.json'
path.write_text(json.dumps(output, separators=(',', ':')) + '\n')
print(f'{len(records)} distinct published plume records saved to {path}')
