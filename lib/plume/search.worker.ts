/// <reference lib="webworker" />
import type {Place} from './types';
const placeCache=new Map<string,Place[]>();
const normalize=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
self.onmessage=async(e:MessageEvent<{query?:string;placeId?:string;request:number;origin:string}>)=>{
 const {request,origin,placeId}=e.data,query=normalize((e.data.query||'').trim().slice(0,120));
 const file=(placeId?placeId.startsWith('us-'):/^\d{2,5}$/.test(query))?'places-us.json':'places-cities.json';
 try{
  let places=placeCache.get(file);
  if(!places){const response=await fetch(new URL('/data/'+file,origin));if(!response.ok)throw new Error();places=await response.json() as Place[];placeCache.set(file,places);}
  if(placeId){self.postMessage({request,place:places.find(p=>p.id===placeId)||null});return;}
  const matches=places.filter(p=>normalize([p.name,p.ascii,p.postal,p.admin,p.country].filter(Boolean).join(' ')).includes(query));
  matches.sort((a,b)=>Number(normalize(b.name)===query)-Number(normalize(a.name)===query)||b.population-a.population);
  self.postMessage({request,results:matches.slice(0,12)});
 }catch{self.postMessage({request,error:'The place index could not be loaded. Try again or open an included investigation.'});}
};
