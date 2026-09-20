'use client';
import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {ArrowRight,ArrowUpRight,CalendarDays,Info,Layers3,LoaderCircle,MapPin,Search} from 'lucide-react';
import {Header} from './header';
import {WorkspaceForeground} from './workspace-foreground';
import {PlaceSearch} from './place-search';
import {useSnapshot} from './use-snapshot';
import {distanceKm,dateLabel} from '@/lib/plume/evidence';
import type {Place} from '@/lib/plume/types';
import plumeImages from '@/public/data/santiago-plumes/manifest.json';
import type {CatalogObservation,RegionalCatalog} from '@/lib/plume/catalog';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
const PlaceMap=dynamic(()=>import('./place-map'),{ssr:false});
export default function PlaceWorkspace({placeId,initialRadius}:{placeId:string;initialRadius:number}){
 const router=useRouter(),{snapshot,error:snapshotError}=useSnapshot();
 const [catalog,setCatalog]=useState<RegionalCatalog>(),[catalogError,setCatalogError]=useState(''),[selectedId,setSelectedId]=useState('');
 useEffect(()=>{const controller=new AbortController();fetch('/data/santiago-catalog.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<RegionalCatalog>;}).then(setCatalog).catch(e=>{if(e.name!=='AbortError')setCatalogError('Regional catalog unavailable. Only reviewed investigations are shown.');});return()=>controller.abort();},[]);
 const [place,setPlace]=useState<Place>(),[error,setError]=useState(''),[search,setSearch]=useState(false),[from,setFrom]=useState(''),[to,setTo]=useState('');
 useEffect(()=>{const w=new Worker('/workers/search.js',{type:'module'});w.onmessage=e=>{if(e.data.error)setError(e.data.error);else if(!e.data.place)setError('This place is not in the included geographic index.');else setPlace(e.data.place);};w.onerror=()=>setError('The place index could not be loaded.');w.postMessage({placeId,request:1,origin:location.origin});return()=>w.terminate();},[placeId]);
 const radius=initialRadius;
 const nearby=useMemo(()=>snapshot&&place?[...snapshot.observations,...(catalog?.observations||[])].filter(o=>distanceKm(place.location,o.location)<=radius):[],[snapshot,place,radius,catalog]);
 const visible=useMemo(()=>nearby.filter(o=>(!from||o.date.slice(0,10)>=from)&&(!to||o.date.slice(0,10)<=to)),[nearby,from,to]);
 const selected=visible.find(o=>o.id===selectedId)||visible.find(o=>!o.caseId);
 const selectedImage=selected?plumeImages[selected.id as keyof typeof plumeImages]:undefined;
 const regional=visible.filter(o=>!o.caseId);
 const cases=snapshot?.cases.filter(c=>visible.some(o=>o.caseId===c.id))||[];
 function openObservation(o:CatalogObservation){if(o.caseId)router.push('/investigations/'+o.caseId+'?observation='+encodeURIComponent(o.id));else setSelectedId(o.id);}
 if(error||snapshotError)return <><Header/><main className="error-page"><Info/><h1>Search unavailable</h1><p>{error||snapshotError}</p><Link href="/explore" className="pill primary">Browse reviewed investigations</Link></main></>;
 if(!place||!snapshot||(!catalog&&!catalogError))return <><Header/><main className="error-page"><LoaderCircle className="spin"/><p>Opening the place on the map…</p></main></>;
 const label=place.name+(place.postal?' '+place.postal:'');
 return <div className="application investigation-application place-application"><Header place={label} onSearch={()=>setSearch(true)}/><div className="workspace-art" aria-hidden="true"/><WorkspaceForeground/><main className="workspace place-workspace">
  <aside className="case-rail place-filters" aria-label="Search filters"><p className="eyebrow">METHANE EXPLORER</p><h1>{label}</h1><p className="place-region">{place.admin}, {place.country}</p><button className="place-action" onClick={()=>setSearch(true)}><Search size={16}/> Search another place <ArrowRight size={14}/></button>
   <label className="radius-label">Search radius<select value={radius} onChange={e=>{const r=Number(e.target.value);router.replace('/places/'+place.id+'?radius='+r,{scroll:false});}}>{[10,25,50,100].map(r=><option key={r} value={r}>Within {r} km</option>)}</select></label>
   <fieldset className="place-date-filters"><legend>Date range</legend><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>{(from||to)&&<button className="text-link" onClick={()=>{setFrom('');setTo('');}}>Reset dates</button>}</fieldset>
   <div className="place-data-source"><Layers3 size={18}/><div><strong>Data sources</strong><p>Sentinel-5P · atmospheric layer</p><small>Carbon Mapper & NASA · plume records</small></div></div>
   <div className="place-map-key"><h3>On the map</h3><p><i className="place-center-key"/> Approximate place center</p><p><i className="place-ring-key"/> Search radius · {radius} km</p><p><i className="place-observation-key"/> Published detection / cluster count</p><p><i className="place-footprint-key"/> Selected plume footprint</p></div><p className="place-coverage-note"><Info size={16}/> The circle is a search area, not a plume boundary or an exposure estimate.</p>
  </aside>
  <section className="place-map-column"><div className="place-results-title"><MapPin size={17}/><span>Showing results for <strong>{label}</strong></span><span>{visible.length} case / regional records</span></div><div className="place-map-stage"><PlaceMap place={place} radius={radius} observations={visible} selected={selected} onObservation={openObservation}/></div><div className="place-results-footer"><Info size={16}/><p>{visible.length?`${visible.length} published observations on ${new Set(visible.map(o=>o.date.slice(0,10))).size} dates. Gold marks detections. Numbered circles group nearby records; select a record to see its footprint.`:'Regional colors show monthly column methane. No nearby case records does not mean zero methane.'}</p></div></section>
  <aside className="findings-panel place-results" aria-label="Search results"><p className="eyebrow">PUBLISHED METHANE OBSERVATIONS</p><h2>{visible.length?'Methane comes into view.':'The regional picture.'}</h2>{catalogError&&<p role="alert">{catalogError}</p>}{visible.length?<><p className="place-result-summary">{visible.length} observations · {new Set(visible.map(o=>o.date.slice(0,10))).size} dates · within {radius} km</p>{cases.map(c=>{const records=snapshot.observations.filter(o=>o.caseId===c.id&&visible.some(v=>v.id===o.id));return <Link className="place-result-card" key={c.id} href={'/investigations/'+c.id+'?observation='+records[0].id}><img src={records[0].asset.url} alt=""/><div><h3>{c.place}</h3><p>{records.length} observations · {new Set(records.map(o=>o.date.slice(0,10))).size} dates</p><small>{dateLabel(records[0].date,true)} — {dateLabel(records.at(-1)!.date,true)}</small><p>Nearest included origin: {Math.min(...records.map(o=>distanceKm(place.location,o.location))).toFixed(1)} km</p></div><ArrowRight size={17}/></Link>})}</>:<div className="place-no-results"><p className="atmospheric-context">Colors show monthly atmospheric methane in ppbv. The month selector changes this regional layer; it does not identify individual emitters.</p><Info size={27}/><h3>No case or regional records nearby</h3><p>{nearby.length?'The selected date range excludes the nearby observations.':'No case or regional plume record falls within '+radius+' km of '+label+'. Zoom in to explore the separate worldwide NASA catalog.'}</p><p>This does not establish that methane emissions are absent.</p>{nearby.length>0&&<button className="text-link" onClick={()=>{setFrom('');setTo('');}}>Reset date range</button>}</div>}
   {selected&&regional.length>0&&<section className="catalog-selection" aria-label="Selected catalog observation">
    <div className="catalog-date"><CalendarDays size={17}/>{dateLabel(selected.date,true)}<span>{selected.instrument}</span></div>
    {selectedImage?<figure className="catalog-plume-preview"><img src={selectedImage.previewUrl} alt={`Methane enhancement contours derived from measurements on ${dateLabel(selected.date,true)}`}/><figcaption>Derived contour bands <span>0–{selectedImage.scale[1].toLocaleString()} ppm·m</span></figcaption></figure>:<h3>Selected observation</h3>}
    <p>{selectedImage?'Contours derived from this acquisition’s methane measurements. Inspect the sensor pixels on the map.':'The gold outline is this record’s published plume footprint. Concentration imagery is not prepared for this date.'}</p>
    <dl><div><dt>Source attribution</dt><dd>Not assessed</dd></div><div><dt>Emission rate</dt><dd>Not included in this excerpt</dd></div></dl>
    <a className="pill primary" href={selected.sourceUrl} target="_blank" rel="noreferrer">View original record <ArrowUpRight size={16}/></a>
    <p className="catalog-caution">A detection describes one acquisition. It does not establish continuous emissions or ground-level exposure.</p>
   </section>}
   {regional.length>0&&<section className="catalog-records" aria-label="Regional catalog records"><h3>Observations · newest first <span>{regional.length}</span></h3><div>{regional.map(o=><button key={o.id} aria-pressed={selected?.id===o.id} onClick={()=>setSelectedId(o.id)}><span><strong>{dateLabel(o.date,true)}</strong><small>{o.instrument} · {distanceKm(place.location,o.location).toFixed(1)} km from center</small></span><ArrowRight size={15}/></button>)}</div><p>Different plumes can share an acquisition. Processing versions of the same plume are counted once.</p></section>}
   <div className={"place-next "+(regional.length?"regional-footer":"")}><h3>{regional.length?'Regional catalog snapshot':visible.length?'Go deeper':'Explore a reviewed investigation'}</h3><p>{regional.length?'Santiago excerpt · retrieved 19 Sep 2026. These catalog records are separate from reviewed investigation briefs.':visible.length?'Open an investigation to compare dates, review source records, and create an evidence brief.':'These examples are in other locations. They show how to read the evidence and its limits.'}</p>{!visible.length&&snapshot.cases.map(c=><Link href={'/investigations/'+c.id} className="place-example" key={c.id}>{c.place}<ArrowRight size={16}/></Link>)}<Link href="/method#coverage" className="text-link">Coverage & limitations <ArrowRight size={14}/></Link></div>
  </aside>
 </main><Sheet open={search} onOpenChange={setSearch}><SheetContent className="plume-sheet"><SheetHeader><SheetTitle>Find a place</SheetTitle><SheetDescription>Select a result to open its map.</SheetDescription></SheetHeader><div className="sheet-body"><PlaceSearch snapshot={snapshot} onNavigate={()=>setSearch(false)}/></div></SheetContent></Sheet></div>;
}
