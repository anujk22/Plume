"""Build the frozen, attributed gazetteer from official GeoNames downloads.

Usage: python prepare_places.py /path/to/downloads
Expected cities15000.zip, US.zip, admin1CodesASCII.txt, countryInfo.txt.
"""
from pathlib import Path
import sys,json,zipfile,hashlib
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]);out=root/'public/data'
admins={r[0]:r[1] for line in (source/'admin1CodesASCII.txt').read_text().splitlines() if len(r:=line.split('\t'))>=2}
countries={r[0]:r[4] for line in (source/'countryInfo.txt').read_text().splitlines() if not line.startswith('#') and len(r:=line.split('\t'))>4}
places=[]
with zipfile.ZipFile(source/'cities15000.zip') as z:
 for line in z.read('cities15000.txt').decode().splitlines():
  r=line.split('\t');places.append({'id':r[0],'name':r[1],'ascii':r[2],'country':countries.get(r[8],r[8]),'countryCode':r[8],'admin':admins.get(r[8]+'.'+r[10],r[10]),'location':[float(r[5]),float(r[4])],'population':int(r[14]),'type':'city'})
postal=[]
with zipfile.ZipFile(source/'US.zip') as z:
 for i,line in enumerate(z.read('US.txt').decode().splitlines()):
  r=line.split('\t');postal.append({'id':'us-'+str(i),'name':r[2],'postal':r[1],'country':'United States','admin':r[3],'location':[float(r[10]),float(r[9])],'population':0,'type':'ZIP centroid'})
for name,items in [('places-cities.json',places),('places-us.json',postal)]:
 (out/name).write_text(json.dumps(items,separators=(',',':'),ensure_ascii=False))
ledger={'retrievedAt':'2026-09-19','provider':'GeoNames','license':'CC BY 4.0','sourceUrls':['https://download.geonames.org/export/dump/cities15000.zip','https://download.geonames.org/export/zip/US.zip','https://download.geonames.org/export/dump/admin1CodesASCII.txt','https://download.geonames.org/export/dump/countryInfo.txt'],'inputs':{f:hashlib.sha256((source/f).read_bytes()).hexdigest() for f in ['cities15000.zip','US.zip','admin1CodesASCII.txt','countryInfo.txt']},'cityCount':len(places),'postalCount':len(postal)}
(out/'places-manifest.json').write_text(json.dumps(ledger,indent=2)+'\n')
print(ledger['cityCount'], 'cities;',ledger['postalCount'],'postal centroids; administrative names indexed with their cities')
