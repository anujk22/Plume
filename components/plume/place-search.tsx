'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowRight,LoaderCircle,MapPin,Search} from 'lucide-react';
import type {Snapshot,Place} from '@/lib/plume/types';
export function PlaceSearch({snapshot,onNavigate,variant='panel'}:{snapshot:Snapshot;onNavigate?:()=>void;onNotice?:(text:string)=>void;variant?:'panel'|'hero'|'compact'}){
 const router=useRouter(),id=useId(),inline=variant!=='panel';
 const [query,setQuery]=useState(''),[results,setResults]=useState<Place[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1);
 const worker=useRef<Worker|null>(null),request=useRef(0),root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null);
 useEffect(()=>{const w=new Worker('/workers/search.js',{type:'module'});worker.current=w;w.onmessage=e=>{if(e.data.request!==request.current)return;setLoading(false);setError(e.data.error||'');setResults(e.data.results||[]);};w.onerror=()=>{setLoading(false);setError('Place lookup is unavailable. Included investigations remain accessible.');};return()=>w.terminate();},[]);
 useEffect(()=>{const requestId=++request.current;setResults([]);setActive(-1);if(query.trim().length<2){setLoading(false);return;}setLoading(true);const timer=setTimeout(()=>worker.current?.postMessage({query,request:requestId,origin:location.origin}),220);return()=>clearTimeout(timer);},[query]);
 useEffect(()=>{if(!inline||!open)return;const dismiss=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};document.addEventListener('pointerdown',dismiss);return()=>document.removeEventListener('pointerdown',dismiss);},[inline,open]);
 useEffect(()=>{if(active>=0)document.getElementById(id+'-'+active)?.scrollIntoView({block:'nearest'});},[active,id]);
 function openPlace(p:Place){setOpen(false);onNavigate?.();router.push('/places/'+encodeURIComponent(p.id));}
 const suggestions=<>
  <p className="body-note">{inline?'Find a place, or explore an included investigation.':'Choose a place to open its map. Coverage is limited to the investigations included in this snapshot.'}</p>
  {loading&&<p className="loading-line" role="status"><LoaderCircle className="spin" size={15}/> Looking up the place…</p>}
  {error&&<p role="alert" className="attention-box">{error}</p>}
  <div id={id+'-results'} role={inline?'listbox':undefined} aria-label={inline?'Places':undefined} aria-busy={loading}>{results.map((p,i)=><button key={p.id} id={id+'-'+i} className={'place-option '+(inline&&active===i?'is-active':'')} role={inline?'option':undefined} aria-selected={inline?active===i:undefined} onPointerMove={()=>inline&&setActive(i)} onClick={()=>openPlace(p)}><MapPin size={17}/><span><strong>{p.name}{p.postal?' · '+p.postal:''}</strong><small>{p.admin} · {p.country} · {p.type}</small></span><ArrowRight size={14}/></button>)}</div>
  {!loading&&query.trim().length>=2&&!results.length&&!error&&<div className="empty-state"><h3>Place not resolved</h3><p>Try a major city, a regional center, or a US ZIP code.</p></div>}
  {query.trim().length<2&&<><h3 className="sheet-section-title">{inline?'Reviewed investigations':'Or open a reviewed investigation'}</h3>{snapshot.cases.map(c=><Link className="text-link" href={'/investigations/'+c.id} key={c.id} onClick={()=>{setOpen(false);onNavigate?.();}}>{c.place} <ArrowRight size={14}/></Link>)}</>}
  <p className="data-credit">{inline?'Coverage is limited to included cases. ':''}Place data: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a>, CC BY 4.0.{!inline&&' Geographic distance is not exposure or source attribution.'}</p>
 </>;
 return <div ref={root} className={'place-search-content '+(inline?'home-inline-search home-'+variant+'-search':'')} onBlur={e=>{if(inline&&!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
  <form className={inline?variant==='hero'?'home-search':'home-place':undefined} onClick={()=>inline&&input.current?.focus()} onSubmit={e=>{e.preventDefault();if(inline&&!open){setOpen(true);input.current?.focus();return;}if(!loading&&(results.length===1||(inline&&results.length)))openPlace(results[active>=0?active:0]);}}>
   <label className={inline?'inline-search-field':'search-box'}><Search size={inline?22:18}/><input ref={input} autoFocus={!inline} value={query} onFocus={()=>inline&&setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(-1);}} onKeyDown={e=>{
    if(!inline)return;
    if(e.key==='Escape'){e.preventDefault();setOpen(false);setActive(-1);}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);if(results.length)setActive(i=>e.key==='ArrowDown'?Math.min(i+1,results.length-1):i<0?results.length-1:Math.max(0,i-1));}
   }} maxLength={120} placeholder={variant==='hero'?'Search a city, region, or ZIP code…':variant==='compact'?'Find an investigation':'City, region, or US ZIP code'} aria-label="City, region, or US ZIP code" role={inline?'combobox':undefined} aria-expanded={inline?open:undefined} aria-controls={inline&&open?id+'-results':undefined} aria-autocomplete={inline?'list':undefined} aria-activedescendant={inline&&open&&active>=0?id+'-'+active:undefined}/></label>
   {inline&&<button type="submit" className={variant==='hero'?'circle':'inline-search-submit'} aria-label="Search places"><ArrowRight size={variant==='hero'?22:17}/></button>}
  </form>
  {inline?open&&<div className="home-search-dropdown">{suggestions}</div>:suggestions}
 </div>;
}
