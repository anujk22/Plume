'use client';
import GlobalDetections from './global-detections';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Map as MapInstance,StyleSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Crosshair,Focus,Info,Map as MapIcon} from 'lucide-react';
import type {Place} from '@/lib/plume/types';
import plumeImages from '@/public/data/santiago-plumes/manifest.json';
import {dateLabel} from '@/lib/plume/evidence';
import type {CatalogObservation} from '@/lib/plume/catalog';
maplibregl.setWorkerUrl('/workers/maplibre-gl-worker.mjs');
type Props={place:Place;radius:number;observations:CatalogObservation[];selected?:CatalogObservation;onObservation:(o:CatalogObservation)=>void};
function searchRing(place:Place,radius:number){
 const lat=place.location[1]*Math.PI/180,lon=place.location[0]*Math.PI/180,d=radius/6371;
 return Array.from({length:73},(_,i)=>{const a=i/72*2*Math.PI,y=Math.asin(Math.sin(lat)*Math.cos(d)+Math.cos(lat)*Math.sin(d)*Math.cos(a));const x=lon+Math.atan2(Math.sin(a)*Math.sin(d)*Math.cos(lat),Math.cos(d)-Math.sin(lat)*Math.sin(y));return [x*180/Math.PI,y*180/Math.PI];});
}
export default function PlaceMap(props:Props){
 const [catalogMap,setCatalogMap]=useState<MapInstance|null>(null);
 const [focused,setFocused]=useState(!!props.selected),[pixels,setPixels]=useState(false);
 const pixelMode=useRef(pixels);
 const mode=useRef(focused);
 const selectedImage=props.selected?plumeImages[props.selected.id as keyof typeof plumeImages]:undefined;
 const container=useRef<HTMLDivElement>(null),map=useRef<MapInstance|null>(null),current=useRef(props);
 useEffect(()=>{current.current=props;mode.current=focused;pixelMode.current=pixels;});
 const [error,setError]=useState('');
 function fit(){
  const p=current.current,m=map.current;if(!m)return;
  const image=p.selected?plumeImages[p.selected.id as keyof typeof plumeImages]:undefined;
  const points=mode.current&&p.selected?(image?[[image.bounds[0],image.bounds[1]],[image.bounds[2],image.bounds[3]]]:[[p.selected.location[0]-.012,p.selected.location[1]-.008],[p.selected.location[0]+.012,p.selected.location[1]+.008]]):searchRing(p.place,p.radius);
  m.fitBounds([[Math.min(...points.map(c=>c[0])),Math.min(...points.map(c=>c[1]))],[Math.max(...points.map(c=>c[0])),Math.max(...points.map(c=>c[1]))]],{padding:window.innerWidth>=1200?{top:145,bottom:130,left:(container.current?.closest('.workspace')?.querySelector('.case-rail')?.clientWidth||270)+100,right:(container.current?.closest('.workspace')?.querySelector('.findings-panel')?.clientWidth||330)+100}:mode.current&&p.selected?{top:165,bottom:190,left:45,right:45}:65,duration:0,maxZoom:mode.current&&p.selected?14:4.5});
 }
 function update(){
  const m=map.current;if(!m?.getSource('search-area'))return;const p=current.current;
  (m.getSource('search-area') as maplibregl.GeoJSONSource).setData({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[searchRing(p.place,p.radius)]}});
  (m.getSource('observations') as maplibregl.GeoJSONSource).setData({type:'FeatureCollection',features:p.observations.map(o=>({type:'Feature',properties:{id:o.id},geometry:{type:'Point',coordinates:o.location}}))});
  (m.getSource('selected-footprint') as maplibregl.GeoJSONSource).setData(p.selected?.outline||{type:'FeatureCollection',features:[]});
  (m.getSource('selected-origin') as maplibregl.GeoJSONSource).setData({type:'FeatureCollection',features:p.selected?[{type:'Feature',properties:{},geometry:{type:'Point',coordinates:p.selected.location}}]:[]});
  const asset=p.selected?plumeImages[p.selected.id as keyof typeof plumeImages]:undefined;
  for(const id of ['methane-contours','methane-contour-lines'])if(m.getLayer(id))m.removeLayer(id);
  if(m.getSource('methane-contours'))m.removeSource('methane-contours');
  if(m.getLayer('methane-raster'))m.removeLayer('methane-raster');
  if(m.getSource('methane-image'))m.removeSource('methane-image');
  if(asset&&pixelMode.current){m.addSource('methane-image',{type:'image',url:asset.url,coordinates:asset.coordinates as [[number,number],[number,number],[number,number],[number,number]]});m.addLayer({id:'methane-raster',type:'raster',source:'methane-image',paint:{'raster-opacity':1,'raster-resampling':'nearest','raster-fade-duration':0}},'selected-footprint-edge');}
  if(asset&&!pixelMode.current){m.addSource('methane-contours',{type:'geojson',tolerance:0,data:asset.contoursUrl});m.addLayer({id:'methane-contours',type:'fill',source:'methane-contours',paint:{'fill-color':['get','color'],'fill-opacity':1,'fill-antialias':false}},'selected-footprint-edge');m.addLayer({id:'methane-contour-lines',type:'line',source:'methane-contours',paint:{'line-color':'#ffe2a5','line-width':.3,'line-opacity':0}},'selected-footprint-edge');}
  m.setPaintProperty('selected-footprint-fill','fill-opacity',asset?0:.22);
  for(const id of ['observations','observation-clusters','observation-counts','cluster-halo','place','search-area'])if(m.getLayer(id))m.setLayoutProperty(id,'visibility',mode.current&&p.selected?'none':'visible');

 }
 useEffect(()=>{
  if(!container.current)return;let disposed=false;const controller=new AbortController();let m:MapInstance;
  // Constructor failures need an accessible fallback when WebGL is unavailable.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  try{m=new maplibregl.Map({container:container.current,center:props.place.location,zoom:10,style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#d5e4d8'}}]},attributionControl:{compact:true,customAttribution:'Place: <a href="https://www.geonames.org/">GeoNames</a> · Observations: <a href="https://carbonmapper.org/terms">Carbon Mapper</a> · <a href="https://earth.jpl.nasa.gov/emit/data/data-portal/Greenhouse-Gases/">NASA/JPL EMIT</a>'}});}catch{setError('Interactive map unavailable. The search results and location remain available.');return;}
  map.current=m;setCatalogMap(m);const resize=new ResizeObserver(()=>{m.resize();fit();});resize.observe(container.current);
  m.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');m.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  m.on('style.load',()=>{
   m.addSource('search-area',{type:'geojson',data:{type:'FeatureCollection',features:[]}});m.addLayer({id:'search-area',type:'line',source:'search-area',paint:{'line-color':'#507e7b','line-width':1,'line-opacity':.4,'line-dasharray':[4,7]}});
   m.addSource('place',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Point',coordinates:current.current.place.location}}});m.addLayer({id:'place',type:'circle',source:'place',paint:{'circle-radius':7,'circle-color':'#073f4b','circle-stroke-color':'white','circle-stroke-width':3}});
   m.addSource('selected-footprint',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   m.addLayer({id:'selected-footprint-fill',type:'fill',source:'selected-footprint',paint:{'fill-color':'#f3ce60','fill-opacity':.25}});
   m.addLayer({id:'selected-footprint-edge',type:'line',source:'selected-footprint',paint:{'line-color':'#e2d692','line-width':1.3,'line-opacity':.6}});
   m.addSource('observations',{type:'geojson',cluster:true,clusterRadius:30,clusterMaxZoom:14,data:{type:'FeatureCollection',features:[]}});
   m.addLayer({id:'cluster-halo',type:'circle',source:'observations',filter:['has','point_count'],paint:{'circle-radius':27,'circle-color':'#f5d676','circle-opacity':.13}});
   m.addLayer({id:'observation-clusters',type:'circle',source:'observations',filter:['has','point_count'],paint:{'circle-radius':19,'circle-color':'#e5c361','circle-stroke-color':'#fff4c5','circle-stroke-width':3}});
   if(m.getStyle().glyphs)m.addLayer({id:'observation-counts',type:'symbol',source:'observations',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#083e49'}});
   m.addLayer({id:'observations',type:'circle',source:'observations',filter:['!',['has','point_count']],paint:{'circle-radius':9,'circle-color':'#e9c45c','circle-stroke-color':'#073f4b','circle-stroke-width':2}});
   m.addSource('selected-origin',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   m.addLayer({id:'selected-halo',type:'circle',source:'selected-origin',paint:{'circle-radius':18,'circle-color':'#fff5c3','circle-opacity':.13}});
   m.addLayer({id:'selected-origin',type:'circle',source:'selected-origin',paint:{'circle-radius':5,'circle-color':'#fffef0','circle-stroke-color':'#b9d1bd','circle-stroke-width':2}});
   update();
  });
  m.on('click','observation-clusters',async e=>{const feature=e.features?.[0];if(!feature||feature.geometry.type!=='Point')return;const zoom=await (m.getSource('observations') as maplibregl.GeoJSONSource).getClusterExpansionZoom(feature.properties.cluster_id);if(!disposed)m.easeTo({center:feature.geometry.coordinates as [number,number],zoom,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:500});});
  m.on('click','observations',e=>{const o=current.current.observations.find(o=>o.id===e.features?.[0]?.properties.id);if(o)current.current.onObservation(o);});
  m.on('mouseenter','observations',()=>{m.getCanvas().style.cursor='pointer';});m.on('mouseleave','observations',()=>{m.getCanvas().style.cursor='';});
  fetch('https://tiles.openfreemap.org/styles/liberty',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<StyleSpecification>;}).then(style=>{if(disposed)return;style.layers=style.layers.filter(l=>l.type!=='fill-extrusion'&&!(l.type==='symbol'&&l.layout?.['icon-image']&&!l.layout?.['text-field']));
   for(const l of style.layers){const id=l.id.toLowerCase();
    if(l.type==='background')l.paint={'background-color':'#d5e4d8'};
    if(l.type==='fill'){l.paint={...l.paint,'fill-color':id.includes('water')?'#9fc9c5':id.includes('building')?'#b3cbbf':id.includes('park')?'#b8d0b9':id.includes('landcover')?'#c5d9c4':'#d5e4d8'};delete l.paint['fill-pattern'];}
    if(l.type==='line'&&/road|motorway|highway|path|bridge|tunnel/.test(id))l.paint={...l.paint,'line-color':id.includes('casing')?'#a8bfb2':id.includes('motorway')?'#fff9e8':'#f3f2e3'};
    if(l.type==='line'&&!/road|motorway|highway|path|bridge|tunnel/.test(id))l.paint={...l.paint,'line-color':id.includes('water')?'#80aaa7':'#a4bbaa'};
    if(l.type==='symbol')l.paint={...l.paint,'text-color':'#365e61','text-halo-color':'#edf3e8','text-halo-width':1.5};
   }m.setStyle(style);}).catch(e=>{if(!disposed&&e.name!=='AbortError')setError('Basemap unavailable. Location, search area, and included observations remain shown.');});
  return()=>{disposed=true;controller.abort();resize.disconnect();m.remove();map.current=null;};
 // The route owns a stable place; filters update the existing map.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(update,[props.radius,props.observations,props.selected,focused,pixels]);
 useEffect(fit,[props.radius,props.selected,focused]);
 return <section className={'place-map '+(focused&&props.selected?'plume-focused':'')} aria-label={`Search map centered on ${props.place.name}`}>
  <div ref={container} className="place-map-canvas"/>
  {props.selected&&<><div className="map-view-switch" aria-label="Map view"><button aria-pressed={!focused} onClick={()=>setFocused(false)}><MapIcon size={15}/> Area overview</button><button aria-pressed={focused} onClick={()=>setFocused(true)}><Focus size={15}/> Selected plume</button></div>
   {focused&&<div className="plume-map-caption"><span className="eyebrow">{selectedImage?(pixels?'SENSOR PIXELS':'METHANE CONTOUR BANDS'):'PUBLISHED PLUME OUTLINE'}</span><h2>{dateLabel(props.selected.date,true)}</h2><p>{props.selected.instrument} · Source: Carbon Mapper</p></div>}
   {focused&&selectedImage&&<div className="plume-measurement-legend"><div><strong>Column enhancement</strong><span>ppm·m</span></div><div className="inferno-scale"/><div><span>0</span><span>{selectedImage.scale[1].toLocaleString()}</span></div><p>{pixels?'Original samples · nearest-neighbor display':'64 color bands · interpolated within measured cells'}</p><button className="plume-render-toggle" aria-pressed={pixels} onClick={()=>setPixels(!pixels)}>{pixels?'Show contour bands':'Inspect sensor pixels'}</button></div>}
   {!focused&&<button className="inspect-plume" onClick={()=>setFocused(true)}><Focus size={16}/> Zoom to detection</button>}</>}
  <GlobalDetections map={catalogMap}/>
  <button className="recenter" onClick={fit}><Crosshair size={16}/> Recenter</button>{error&&<p role="status" className="map-error"><Info size={14}/>{error}</p>}
 </section>;
}
