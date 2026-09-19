import {validateSnapshot} from './validate';
import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {assess,canonicalize,canonicalInput,dateCounts,distanceKm,findings,selectObservations,sha256} from './evidence';
import type {Snapshot} from './types';
const snapshot=JSON.parse(readFileSync(new URL('../../public/data/plume-2026-09-19/snapshot.json',import.meta.url),'utf8')) as Snapshot;
const us=snapshot.cases.find(c=>c.id==='newby-island')!;
const observations=selectObservations(snapshot,us.id);
describe('evidence invariants',()=>{
 it('recomputes 3, 2, 1, and zero selected-date findings without changing the full case',()=>{
  for(const n of [3,2,1,0]){const selection=observations.slice(0,n);const claims=findings(us,selection);expect(claims[0].evidenceIds).toEqual(selection.map(o=>o.id));if(n>1)expect(claims[0].text).toContain(`on ${n} dates`);if(n===1)expect(claims[0].text).toContain('does not establish repeated');if(n===0)expect(claims[0].text).toContain('No observations');}
  expect(selectObservations(snapshot,us.id)).toHaveLength(3);
 });
 it('counts product copies as one acquisition, even when represented multiple times',()=>{
  const same=observations[0];expect(dateCounts([same,{...same,id:'product-copy'}])).toEqual({acquisitions:1,days:1,observations:2});
  const y=selectObservations(snapshot,'yemen-area');expect(snapshot.relationships).toHaveLength(7);expect(dateCounts(y).acquisitions).toBe(2);
 });
 it('never allows an annual discrepancy from isolated rates and a reported annual mass',()=>{
  const result=assess(us,observations);expect(result.find(x=>x.id==='quantity')?.status).toBe('failed');expect(result.find(x=>x.id==='period')?.status).toBe('failed');expect(result.find(x=>x.id==='identity')?.status).toBe('unknown');expect(result.find(x=>x.id==='gas')?.status).toBe('satisfied');
 });
 it('excludes private notes by default and rejects cross-case selection',()=>{
  const input=canonicalInput(snapshot,us,[observations[0].id,snapshot.observations[0].id],'private note');expect(input.notes).toBe('');expect(input.selectedIds).toEqual([observations[0].id]);expect(canonicalInput(snapshot,us,[], 'private note',true).notes).toBe('private note');expect(()=>selectObservations(snapshot,'not-a-case')).toThrow();
 });
 it('canonicalizes key order and preserves null independently from zero',async()=>{
  expect(canonicalize({b:0,a:null})).toBe(canonicalize({a:null,b:0}));expect(await sha256(canonicalize({rate:0}))).not.toBe(await sha256(canonicalize({rate:null})));
 });
 it('uses geodesic distance, including near the dateline',()=>{expect(distanceKm([179.9,0],[-179.9,0])).toBeCloseTo(22.239,2);expect(distanceKm(us.location,us.location)).toBe(0);});
});

describe('snapshot boundary',()=>{it('accepts the reviewed dataset',()=>{expect(validateSnapshot(snapshot).observations).toHaveLength(5);});it('rejects exposed suppressed rates and absent asset checksums',()=>{const bad=structuredClone(snapshot);bad.observations[0].rateStatus='suppressed';expect(()=>validateSnapshot(bad)).toThrow('suppressed');const missing=structuredClone(snapshot);missing.files=[];expect(()=>validateSnapshot(missing)).toThrow('checksum');});});
