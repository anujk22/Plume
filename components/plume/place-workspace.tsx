'use client';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {ArrowRight,Info,Layers3,LoaderCircle,MapPin,Search} from 'lucide-react';
import {Header} from './header';
import {PlaceSearch} from './place-search';
import {useSnapshot} from './use-snapshot';
import {distanceKm,dateLabel} from '@/lib/plume/evidence';
import type {Place,Observation} from '@/lib/plume/types';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
const PlaceMap=dynamic(()=>import('./place-map'),{ssr:false});
export default function PlaceWorkspace({placeId,initialRadius}:{placeId:string;initialRadius:number}){
 const router=useRouter(),{snapshot,error:snapshotError}=useSnapshot();
 const [place,setPlace]=useState<Place>(),[error,setError]=useState(''),[radius,setRadius]=useState(initialRadius),[search,setSearch]=useState(false),[from,setFrom]=useState(''),[to,setTo]=useState('');
 useEffect(()=>{const w=new Worker('/workers/search.js',{type:'module'});w.onmessage=e=>{if(e.data.error)setError(e.data.error);else if(!e.data.place)setError('This place is not in the included geographic index.');else setPlace(e.data.place);};w.onerror=()=>setError('The place index could not be loaded.');w.postMessage({placeId,request:1,origin:location.origin});return()=>w.terminate();},[placeId]);
 useEffect(()=>setRadius(initialRadius),[initialRadius]);
 const nearby=useMemo(()=>snapshot&&place?snapshot.observations.filter(o=>distanceKm(place.location,o.location)<=radius):[],[snapshot,place,radius]);
 const visible=useMemo(()=>nearby.filter(o=>(!from||o.date.slice(0,10)>=from)&&(!to||o.date.slice(0,10)<=to)),[nearby,from,to]);
 const cases=snapshot?.cases.filter(c=>visible.some(o=>o.caseId===c.id))||[];
 function openObservation(o:Observation){router.push('/investigations/'+o.caseId+'?observation='+encodeURIComponent(o.id));}
 if(error||snapshotError)return <><Header/><main className="error-page"><Info/><h1>Search unavailable</h1><p>{error||snapshotError}</p><Link href="/explore" className="pill primary">Browse reviewed investigations</Link></main></>;
 if(!place||!snapshot)return <><Header/><main className="error-page"><LoaderCircle className="spin"/><p>Opening the place on the map…</p></main></>;
 const label=place.name+(place.postal?' '+place.postal:'');
 return <div className="application"><Header place={label} onSearch={()=>setSearch(true)}/><div className="workspace-art" aria-hidden="true"/><main className="workspace place-workspace">
  <aside className="case-rail place-filters" aria-label="Search filters"><p className="eyebrow">YOUR SEARCH AREA</p><h1>{label}</h1><p className="place-region">{place.admin}, {place.country}</p><button className="place-action" onClick={()=>setSearch(true)}><Search size={16}/> Search another place <ArrowRight size={14}/></button>
   <label className="radius-label">Search radius<select value={radius} onChange={e=>{const r=Number(e.target.value);setRadius(r);router.replace('/places/'+place.id+'?radius='+r,{scroll:false});}}>{[10,25,50,100].map(r=><option key={r} value={r}>Within {r} km</option>)}</select></label>
   <fieldset className="place-date-filters"><legend>Date range</legend><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>{(from||to)&&<button className="text-link" onClick={()=>{setFrom('');setTo('');}}>Reset dates</button>}</fieldset>
   <div className="place-data-source"><Layers3 size={18}/><div><strong>Data source</strong><p>Carbon Mapper · EMIT</p><small>Historical snapshot · 2024 observations</small></div></div>
   <div className="place-map-key"><h3>On the map</h3><p><i className="place-center-key"/> Approximate place center</p><p><i className="place-ring-key"/> Search radius · {radius} km</p><p><i className="place-observation-key"/> Included observation</p></div><p className="place-coverage-note"><Info size={16}/> The circle is a search area, not a plume boundary or an exposure estimate.</p>
  </aside>
  <section className="place-map-column"><div className="place-results-title"><MapPin size={17}/><span>Showing results for <strong>{label}</strong></span><span>{visible.length} observations</span></div><div className="place-map-stage"><PlaceMap place={place} radius={radius} observations={visible} onObservation={openObservation}/></div><div className="place-results-footer"><Info size={16}/><p>{visible.length?`${visible.length} published observations on ${new Set(visible.map(o=>o.date.slice(0,10))).size} dates. Select a marker or investigation to inspect its evidence.`:'No included observation matches this search. The basemap shows geography, not methane coverage.'}</p></div></section>
  <aside className="findings-panel place-results" aria-label="Search results"><p className="eyebrow">INCLUDED OBSERVATIONS</p><h2>{visible.length?'Evidence nearby':'A place to investigate.'}</h2>{visible.length?<><p className="place-result-summary">{visible.length} observations within {radius} km of {label}.</p>{cases.map(c=>{const records=visible.filter(o=>o.caseId===c.id);return <Link className="place-result-card" key={c.id} href={'/investigations/'+c.id+'?observation='+records[0].id}><img src={records[0].asset.url} alt=""/><div><h3>{c.place}</h3><p>{records.length} observations · {new Set(records.map(o=>o.date.slice(0,10))).size} dates</p><small>{dateLabel(records[0].date,true)} — {dateLabel(records.at(-1)!.date,true)}</small><p>Nearest included origin: {Math.min(...records.map(o=>distanceKm(place.location,o.location))).toFixed(1)} km</p></div><ArrowRight size={17}/></Link>})}</>:<div className="place-no-results"><Info size={27}/><h3>No included observations nearby</h3><p>{nearby.length?'The selected date range excludes the nearby observations.':'This dataset has no published observations within '+radius+' km of '+label+'.'}</p><p>This does not establish that methane emissions are absent.</p>{nearby.length>0&&<button className="text-link" onClick={()=>{setFrom('');setTo('');}}>Reset date range</button>}</div>}
   <div className="place-next"><h3>{visible.length?'Go deeper':'Explore a reviewed investigation'}</h3><p>{visible.length?'Open an investigation to compare dates, review source records, and create an evidence brief.':'These examples are in other locations. They show how to read the evidence and its limits.'}</p>{!visible.length&&snapshot.cases.map(c=><Link href={'/investigations/'+c.id} className="place-example" key={c.id}>{c.place}<ArrowRight size={16}/></Link>)}<Link href="/method#coverage" className="text-link">Understand the dataset’s coverage <ArrowRight size={14}/></Link></div>
  </aside>
 </main><Sheet open={search} onOpenChange={setSearch}><SheetContent className="plume-sheet"><SheetHeader><SheetTitle>Find a place</SheetTitle><SheetDescription>Select a result to open its map.</SheetDescription></SheetHeader><div className="sheet-body"><PlaceSearch snapshot={snapshot} onNavigate={()=>setSearch(false)}/></div></SheetContent></Sheet></div>;
}
