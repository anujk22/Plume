'use client';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Map as MapInstance,StyleSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Crosshair,Focus,Info} from 'lucide-react';
import type {Place} from '@/lib/plume/types';
import type {CatalogObservation} from '@/lib/plume/catalog';
maplibregl.setWorkerUrl('/workers/maplibre-gl-worker.mjs');
type Props={place:Place;radius:number;observations:CatalogObservation[];selected?:CatalogObservation;onObservation:(o:CatalogObservation)=>void};
function searchRing(place:Place,radius:number){
 const lat=place.location[1]*Math.PI/180,lon=place.location[0]*Math.PI/180,d=radius/6371;
 return Array.from({length:73},(_,i)=>{const a=i/72*2*Math.PI,y=Math.asin(Math.sin(lat)*Math.cos(d)+Math.cos(lat)*Math.sin(d)*Math.cos(a));const x=lon+Math.atan2(Math.sin(a)*Math.sin(d)*Math.cos(lat),Math.cos(d)-Math.sin(lat)*Math.sin(y));return [x*180/Math.PI,y*180/Math.PI];});
}
export default function PlaceMap(props:Props){
 const container=useRef<HTMLDivElement>(null),map=useRef<MapInstance|null>(null),current=useRef(props);
 useEffect(()=>{current.current=props;});
 const [error,setError]=useState('');
 function fit(){const p=current.current,ring=searchRing(p.place,p.radius);map.current?.fitBounds([[Math.min(...ring.map(c=>c[0])),Math.min(...ring.map(c=>c[1]))],[Math.max(...ring.map(c=>c[0])),Math.max(...ring.map(c=>c[1]))]],{padding:window.innerWidth>=1200?{top:95,bottom:100,left:(container.current?.closest('.workspace')?.querySelector('.case-rail')?.clientWidth||270)+65,right:(container.current?.closest('.workspace')?.querySelector('.findings-panel')?.clientWidth||330)+65}:45,duration:0});}
 function update(){
  const m=map.current;if(!m?.getSource('search-area'))return;const p=current.current;
  (m.getSource('search-area') as maplibregl.GeoJSONSource).setData({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[searchRing(p.place,p.radius)]}});
  (m.getSource('observations') as maplibregl.GeoJSONSource).setData({type:'FeatureCollection',features:p.observations.map(o=>({type:'Feature',properties:{id:o.id},geometry:{type:'Point',coordinates:o.location}}))});
  (m.getSource('selected-footprint') as maplibregl.GeoJSONSource).setData(p.selected?.outline||{type:'FeatureCollection',features:[]});
  (m.getSource('selected-origin') as maplibregl.GeoJSONSource).setData({type:'FeatureCollection',features:p.selected?[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:p.selected.location}}]:[]});
 }
 useEffect(()=>{
  if(!container.current)return;let disposed=false;const controller=new AbortController();let m:MapInstance;
  // Constructor failures need an accessible fallback when WebGL is unavailable.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  try{m=new maplibregl.Map({container:container.current,center:props.place.location,zoom:10,style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#e4e9de'}}]},attributionControl:{compact:true,customAttribution:'Place: <a href="https://www.geonames.org/">GeoNames</a> · Observations: <a href="https://carbonmapper.org/terms">Carbon Mapper</a>'}});}catch{setError('Interactive map unavailable. The search results and location remain available.');return;}
  map.current=m;const resize=new ResizeObserver(()=>{m.resize();fit();});resize.observe(container.current);
  m.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');m.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  m.on('style.load',()=>{
   m.addSource('search-area',{type:'geojson',data:{type:'FeatureCollection',features:[]}});m.addLayer({id:'search-area',type:'line',source:'search-area',paint:{'line-color':'#267980','line-width':2,'line-dasharray':[3,3]}});
   m.addSource('place',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Point',coordinates:current.current.place.location}}});m.addLayer({id:'place',type:'circle',source:'place',paint:{'circle-radius':7,'circle-color':'#073f4b','circle-stroke-color':'white','circle-stroke-width':3}});
   m.addSource('selected-footprint',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   m.addLayer({id:'selected-footprint-fill',type:'fill',source:'selected-footprint',paint:{'fill-color':'#e4bc4b','fill-opacity':.25}});
   m.addLayer({id:'selected-footprint-edge',type:'line',source:'selected-footprint',paint:{'line-color':'#a87919','line-width':2}});
   m.addSource('observations',{type:'geojson',cluster:true,clusterRadius:30,clusterMaxZoom:14,data:{type:'FeatureCollection',features:[]}});
   m.addLayer({id:'observation-clusters',type:'circle',source:'observations',filter:['has','point_count'],paint:{'circle-radius':19,'circle-color':'#073f4b','circle-stroke-color':'#f5d676','circle-stroke-width':3}});
   if(m.getStyle().glyphs)m.addLayer({id:'observation-counts',type:'symbol',source:'observations',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#fff8df'}});
   m.addLayer({id:'observations',type:'circle',source:'observations',filter:['!',['has','point_count']],paint:{'circle-radius':9,'circle-color':'#e9c45c','circle-stroke-color':'#073f4b','circle-stroke-width':2}});
   m.addSource('selected-origin',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   m.addLayer({id:'selected-halo',type:'circle',source:'selected-origin',paint:{'circle-radius':23,'circle-color':'#e8b640','circle-opacity':.22}});
   m.addLayer({id:'selected-origin',type:'circle',source:'selected-origin',paint:{'circle-radius':10,'circle-color':'#e4b944','circle-stroke-color':'#fffef0','circle-stroke-width':4}});
   update();fit();
  });
  m.on('click','observation-clusters',async e=>{const feature=e.features?.[0];if(!feature||feature.geometry.type!=='Point')return;const zoom=await (m.getSource('observations') as maplibregl.GeoJSONSource).getClusterExpansionZoom(feature.properties.cluster_id);if(!disposed)m.easeTo({center:feature.geometry.coordinates as [number,number],zoom});});
  m.on('click','observations',e=>{const o=current.current.observations.find(o=>o.id===e.features?.[0]?.properties.id);if(o)current.current.onObservation(o);});
  m.on('mouseenter','observations',()=>{m.getCanvas().style.cursor='pointer';});m.on('mouseleave','observations',()=>{m.getCanvas().style.cursor='';});
  fetch('https://tiles.openfreemap.org/styles/liberty',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<StyleSpecification>;}).then(style=>{if(disposed)return;style.layers=style.layers.filter(l=>l.type!=='fill-extrusion'&&!(l.type==='symbol'&&l.layout?.['icon-image']&&!l.layout?.['text-field']));
   for(const l of style.layers){const id=l.id.toLowerCase();
    if(l.type==='background')l.paint={'background-color':'#e4ebdf'};
    if(l.type==='fill'){l.paint={...l.paint,'fill-color':id.includes('water')?'#9cc7c5':id.includes('building')?'#b3cac2':id.includes('park')?'#bad3c2':'#d6e4d8'};delete l.paint['fill-pattern'];}
    if(l.type==='line'&&/road|motorway|highway|path|bridge|tunnel/.test(id))l.paint={...l.paint,'line-color':id.includes('casing')?'#acbeb4':'#f7f7e8'};
    if(l.type==='symbol')l.paint={...l.paint,'text-color':'#426b6b','text-halo-color':'#eef4e8'};
   }m.setStyle(style);}).catch(e=>{if(!disposed&&e.name!=='AbortError')setError('Basemap unavailable. Location, search area, and included observations remain shown.');});
  return()=>{disposed=true;controller.abort();resize.disconnect();m.remove();map.current=null;};
 // The route owns a stable place; filters update the existing map.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(update,[props.radius,props.observations,props.selected]);
 useEffect(fit,[props.radius]);
 return <section className="place-map" aria-label={`Search map centered on ${props.place.name}`}><div ref={container} className="place-map-canvas"/>{props.selected&&<button className="inspect-plume" onClick={()=>map.current?.easeTo({center:props.selected!.location,zoom:13,duration:650})}><Focus size={16}/> Zoom to detection</button>}<button className="recenter" onClick={fit}><Crosshair size={16}/> Recenter</button>{error&&<p role="status" className="map-error"><Info size={14}/>{error}</p>}</section>;
}
