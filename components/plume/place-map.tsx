'use client';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Map as MapInstance,StyleSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Crosshair,Info} from 'lucide-react';
import type {Observation,Place} from '@/lib/plume/types';
maplibregl.setWorkerUrl('/workers/maplibre-gl-worker.mjs');
type Props={place:Place;radius:number;observations:Observation[];onObservation:(o:Observation)=>void};
function searchRing(place:Place,radius:number){
 const lat=place.location[1]*Math.PI/180,lon=place.location[0]*Math.PI/180,d=radius/6371;
 return Array.from({length:73},(_,i)=>{const a=i/72*2*Math.PI,y=Math.asin(Math.sin(lat)*Math.cos(d)+Math.cos(lat)*Math.sin(d)*Math.cos(a));const x=lon+Math.atan2(Math.sin(a)*Math.sin(d)*Math.cos(lat),Math.cos(d)-Math.sin(lat)*Math.sin(y));return [x*180/Math.PI,y*180/Math.PI];});
}
export default function PlaceMap(props:Props){
 const container=useRef<HTMLDivElement>(null),map=useRef<MapInstance|null>(null),current=useRef(props);current.current=props;
 const [error,setError]=useState('');
 function fit(){const p=current.current,ring=searchRing(p.place,p.radius);map.current?.fitBounds([[Math.min(...ring.map(c=>c[0])),Math.min(...ring.map(c=>c[1]))],[Math.max(...ring.map(c=>c[0])),Math.max(...ring.map(c=>c[1]))]],{padding:45,duration:0});}
 function update(){
  const m=map.current;if(!m?.getSource('search-area'))return;const p=current.current;
  (m.getSource('search-area') as maplibregl.GeoJSONSource).setData({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[searchRing(p.place,p.radius)]}});
  (m.getSource('observations') as maplibregl.GeoJSONSource).setData({type:'FeatureCollection',features:p.observations.map(o=>({type:'Feature',properties:{id:o.id},geometry:{type:'Point',coordinates:o.location}}))});fit();
 }
 useEffect(()=>{
  if(!container.current)return;let disposed=false;const controller=new AbortController();let m:MapInstance;
  try{m=new maplibregl.Map({container:container.current,center:props.place.location,zoom:10,style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#e4e9de'}}]},attributionControl:{compact:true,customAttribution:'Place: <a href="https://www.geonames.org/">GeoNames</a> · Observations: <a href="https://carbonmapper.org/terms">Carbon Mapper</a>'}});}catch{setError('Interactive map unavailable. The search results and location remain available.');return;}
  map.current=m;const resize=new ResizeObserver(()=>m.resize());resize.observe(container.current);
  m.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');m.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  m.on('style.load',()=>{
   m.addSource('search-area',{type:'geojson',data:{type:'FeatureCollection',features:[]}});m.addLayer({id:'search-area',type:'line',source:'search-area',paint:{'line-color':'#267980','line-width':2,'line-dasharray':[3,3]}});
   m.addSource('place',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Point',coordinates:current.current.place.location}}});m.addLayer({id:'place',type:'circle',source:'place',paint:{'circle-radius':7,'circle-color':'#073f4b','circle-stroke-color':'white','circle-stroke-width':3}});
   m.addSource('observations',{type:'geojson',data:{type:'FeatureCollection',features:[]}});m.addLayer({id:'observations',type:'circle',source:'observations',paint:{'circle-radius':9,'circle-color':'#e9c45c','circle-stroke-color':'#073f4b','circle-stroke-width':2}});update();
  });
  m.on('click','observations',e=>{const o=current.current.observations.find(o=>o.id===e.features?.[0]?.properties.id);if(o)current.current.onObservation(o);});
  m.on('mouseenter','observations',()=>{m.getCanvas().style.cursor='pointer';});m.on('mouseleave','observations',()=>{m.getCanvas().style.cursor='';});
  fetch('https://tiles.openfreemap.org/styles/liberty',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<StyleSpecification>;}).then(style=>{if(disposed)return;style.layers=style.layers.filter(l=>l.type!=='fill-extrusion');for(const l of style.layers){if(l.type==='background')l.paint={'background-color':'#e7ece1'};if(l.type==='fill'&&l.paint){if(l.id.includes('water'))l.paint['fill-color']='#b4d5d0';else if(l.id.includes('landcover')||l.id.includes('landuse')||l.id.includes('park'))l.paint['fill-color']='#d7e4d7';else if(l.id.includes('building'))l.paint['fill-color']='#c3d3c8';}}m.setStyle(style);}).catch(e=>{if(!disposed&&e.name!=='AbortError')setError('Basemap unavailable. Location, search area, and included observations remain shown.');});
  return()=>{disposed=true;controller.abort();resize.disconnect();m.remove();map.current=null;};
 // The route owns a stable place; filters update the existing map.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(update,[props.radius,props.observations]);
 return <section className="place-map" aria-label={`Search map centered on ${props.place.name}`}><div ref={container} className="place-map-canvas"/><button className="recenter" onClick={fit}><Crosshair size={16}/> Recenter</button>{error&&<p role="status" className="map-error"><Info size={14}/>{error}</p>}</section>;
}
