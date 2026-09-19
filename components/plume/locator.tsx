'use client';
import {useEffect,useState} from 'react';
export function Locator({location,place}:{location:[number,number];place:string}){
 const [paths,setPaths]=useState<string[]>([]);
 useEffect(()=>{fetch('/data/countries.geojson').then(r=>r.json() as Promise<{features:{geometry:{type:string;coordinates:number[][][]|number[][][][]}}[]}>).then(d=>{const out:string[]=[];for(const f of d.features){const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];for(const poly of polys as number[][][][]){out.push(poly.map((ring:number[][])=>ring.map((p,i)=>`${i?'L':'M'}${((p[0]+180)/2).toFixed(1)},${((90-p[1])/2).toFixed(1)}`).join(' ')+'Z').join(' '));}}setPaths(out);}).catch(()=>{});},[]);
 return <div className="locator" aria-label={`World location: ${place}`}><svg viewBox="0 0 180 90" role="img" aria-label={place}>{paths.map((d,i)=><path key={i} d={d} fill="#a3bbb0" stroke="#dfe8dc" strokeWidth=".25"/>)}<circle cx={(location[0]+180)/2} cy={(90-location[1])/2} r="4" fill="#f4d567" stroke="#0b5057" strokeWidth="1.5"/></svg><span>{place}</span></div>;
}
