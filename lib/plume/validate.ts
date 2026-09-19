import type {Snapshot} from './types';
// This boundary validates the frozen contract before any scientific UI is shown.
export function validateSnapshot(value:unknown):Snapshot{
 const s=value as Snapshot;
 const fail=(reason:string):never=>{throw new Error('The evidence snapshot is invalid: '+reason);};
 if(!s||s.id!=='plume-2026-09-19'||s.schemaVersion!=='1.0'||s.rulesVersion!=='1.0'||!Array.isArray(s.observations)||!Array.isArray(s.cases)||!Array.isArray(s.files)||!Array.isArray(s.relationships))fail('unsupported structure or version.');
 const ids=new Set<string>(),acquisitions=new Map<string,string>();
 for(const o of s.observations){
  if(!o.id||ids.has(o.id)||!o.acquisitionId||!Number.isFinite(Date.parse(o.date)))fail('duplicate identity or invalid acquisition time.');ids.add(o.id);
  const previous=acquisitions.get(o.acquisitionId);if(previous&&previous!==o.date)fail('one acquisition has conflicting dates.');acquisitions.set(o.acquisitionId,o.date);
  if(!Array.isArray(o.location)||o.location.length!==2||!o.location.every(Number.isFinite)||Math.abs(o.location[0])>180||Math.abs(o.location[1])>90)fail('invalid location.');
  if(o.rate!==null&&(!Number.isFinite(o.rate)||o.rate<0)||o.uncertainty!==null&&(!Number.isFinite(o.uncertainty)||o.uncertainty<0))fail('invalid numeric measurement.');
  if(o.rateStatus==='suppressed'&&(o.rate!==null||o.uncertainty!==null))fail('suppressed measurement exposed.');
  if(o.asset?.unit!=='ppm·m'||o.asset.scale[0]!==0||!(o.asset.scale[1]>=o.asset.max)||o.asset.coordinates?.length!==4||o.outline?.type!=='FeatureCollection'||!o.asset.url.startsWith('/data/'+s.id+'/'))fail('invalid scientific asset metadata.');
  if(!s.files.some(f=>f.path===o.asset.url.split('/').at(-1)&&/^[a-f0-9]{64}$/.test(f.sha256)))fail('missing evidence checksum.');
 }
 const caseIds=new Set<string>();
 for(const c of s.cases){if(caseIds.has(c.id)||!c.observationIds?.length||c.observationIds.some(id=>!ids.has(id)||s.observations.find(o=>o.id===id)?.caseId!==c.id))fail('invalid case membership.');caseIds.add(c.id);}
 if(s.observations.some(o=>!caseIds.has(o.caseId))||s.relationships.some(r=>!ids.has(r.observationId)))fail('dangling evidence relationship.');
 return s;
}
