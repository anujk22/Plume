'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowRight,LoaderCircle,MapPin,Search} from 'lucide-react';
import type {Snapshot,Place} from '@/lib/plume/types';
export function PlaceSearch({snapshot,onNavigate}:{snapshot:Snapshot;onNavigate?:()=>void;onNotice?:(text:string)=>void}){
 const router=useRouter();
 const [query,setQuery]=useState(''),[results,setResults]=useState<Place[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const worker=useRef<Worker|null>(null),request=useRef(0);
 useEffect(()=>{const w=new Worker('/workers/search.js',{type:'module'});worker.current=w;w.onmessage=e=>{if(e.data.request!==request.current)return;setLoading(false);setError(e.data.error||'');setResults(e.data.results||[]);};w.onerror=()=>{setLoading(false);setError('Place lookup is unavailable. Included investigations remain accessible.');};return()=>w.terminate();},[]);
 useEffect(()=>{const id=++request.current;setResults([]);if(query.trim().length<2){setLoading(false);return;}setLoading(true);const timer=setTimeout(()=>worker.current?.postMessage({query,request:id,origin:location.origin}),220);return()=>clearTimeout(timer);},[query]);
 function openPlace(p:Place){onNavigate?.();router.push('/places/'+encodeURIComponent(p.id));}
 return <div className="place-search-content"><form onSubmit={e=>{e.preventDefault();if(!loading&&results.length===1)openPlace(results[0]);}}><label className="search-box"><Search size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} maxLength={120} placeholder="City, region, or US ZIP code" aria-label="City, region, or US ZIP code"/></label></form><p className="body-note">Choose a place to open its map. Coverage is limited to the investigations included in this snapshot.</p>{loading&&<p className="loading-line" role="status"><LoaderCircle className="spin" size={15}/> Looking up the place…</p>}{error&&<p role="alert" className="attention-box">{error}</p>}{results.map(p=><button key={p.id} className="place-option" onClick={()=>openPlace(p)}><MapPin size={17}/><span><strong>{p.name}{p.postal?' · '+p.postal:''}</strong><small>{p.admin} · {p.country} · {p.type}</small></span><ArrowRight size={14}/></button>)}{!loading&&query.length>=2&&!results.length&&!error&&<div className="empty-state"><h3>Place not resolved</h3><p>Try a major city, a regional center, or a US ZIP code.</p></div>}{query.length<2&&<><h3 className="sheet-section-title">Or open a reviewed investigation</h3>{snapshot.cases.map(c=><Link className="text-link" href={'/investigations/'+c.id} key={c.id}>{c.place} <ArrowRight size={14}/></Link>)}</>}<p className="data-credit">Place data: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a>, CC BY 4.0. Geographic distance is not exposure or source attribution.</p></div>;
}
