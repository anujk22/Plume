'use client';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {Map as MapInstance,StyleSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Crosshair, Info, LoaderCircle} from 'lucide-react';
import {dateLabel} from '@/lib/plume/evidence';
import type {Case,Observation} from '@/lib/plume/types';

type Camera={center:[number,number];zoom:number};
maplibregl.setWorkerUrl('/workers/maplibre-gl-worker.mjs');
const baseStyle:StyleSpecification={version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#e4e9de'}}]};
export default function EvidenceMap({observation,allObservations,caseData,highlight=false,showFacilities=true,camera,onCamera}:{observation:Observation;allObservations:Observation[];caseData:Case;highlight?:boolean;showFacilities?:boolean;camera?:Camera;onCamera?:(c:Camera)=>void}){
 const el=useRef<HTMLDivElement>(null),mapRef=useRef<MapInstance|null>(null),selection=useRef(observation),facilities=useRef(showFacilities),cameraHandler=useRef(onCamera);
 const [error,setError]=useState(''),[ready,setReady]=useState(false),[webglError,setWebglError]=useState(false);
 const bounds=allObservations.reduce((b,o)=>[Math.min(b[0],o.asset.bounds[0]),Math.min(b[1],o.asset.bounds[1]),Math.max(b[2],o.asset.bounds[2]),Math.max(b[3],o.asset.bounds[3])],[180,90,-180,-90]);
 selection.current=observation;facilities.current=showFacilities;cameraHandler.current=onCamera;
 function fit(){mapRef.current?.fitBounds([[bounds[0],bounds[1]],[bounds[2],bounds[3]]],{padding:55,duration:0});}
 useEffect(()=>{
  if(!el.current)return;let disposed=false;const controller=new AbortController();let map:MapInstance;
  try{map=new maplibregl.Map({container:el.current,style:baseStyle,center:caseData.location,zoom:12,attributionControl:{compact:true,customAttribution:'Source: <a href="https://carbonmapper.org/terms" target="_blank" rel="noopener">Carbon Mapper</a>'},canvasContextAttributes:{preserveDrawingBuffer:false}});}catch{setWebglError(true);return;}
  mapRef.current=map;const resize=new ResizeObserver(()=>map.resize());resize.observe(el.current);map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');map.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  map.on('moveend',()=>{const p=map.getCenter();cameraHandler.current?.({center:[p.lng,p.lat],zoom:map.getZoom()});});
  const renderLayers=()=>{
    if(disposed)return;const o=selection.current;
    for(const id of ['plume-origin','facility-labels','facility-points','plume-outline','plume-raster'])if(map.getLayer(id))map.removeLayer(id);
    for(const id of ['plume','outline','origin','facilities'])if(map.getSource(id))map.removeSource(id);
    map.addSource('plume',{type:'image',url:o.asset.url,coordinates:o.asset.coordinates as [[number,number],[number,number],[number,number],[number,number]]});
    map.addLayer({id:'plume-raster',type:'raster',source:'plume',paint:{'raster-opacity':.9,'raster-resampling':'nearest','raster-fade-duration':0}});
    map.addSource('outline',{type:'geojson',data:o.outline});map.addLayer({id:'plume-outline',type:'line',source:'outline',paint:{'line-color':'#f3dfa2','line-width':1.4,'line-opacity':.75}});
    map.addSource('origin',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Point',coordinates:o.location}}});
    map.addLayer({id:'plume-origin',type:'circle',source:'origin',paint:{'circle-radius':6,'circle-color':'#ffffff','circle-stroke-width':3,'circle-stroke-color':'#0a545a'}});
    if(caseData.facilities?.length){map.addSource('facilities',{type:'geojson',data:{type:'FeatureCollection',features:caseData.facilities.map(f=>({type:'Feature',properties:{name:f.name},geometry:{type:'Point',coordinates:f.location}}))}});map.addLayer({id:'facility-points',type:'circle',source:'facilities',layout:{visibility:facilities.current?'visible':'none'},paint:{'circle-radius':6,'circle-color':'#76627d','circle-stroke-color':'#fff','circle-stroke-width':2}});}
  };
  map.on('style.load',renderLayers);map.on('load',()=>{fit();setReady(true);});
  map.on('error',()=>{if(!disposed)setError('Some map detail is unavailable. The dated evidence remains accessible.');});
  fetch('https://tiles.openfreemap.org/styles/liberty',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<StyleSpecification>;}).then((style)=>{
    if(disposed)return;
    style.layers=style.layers.filter(l=>!l.id.includes('3d'));
    for(const layer of style.layers){if(layer.type==='background')layer.paint={'background-color':'#e7ece1'};if(layer.type==='fill'&&layer.paint){const id=layer.id.toLowerCase();if(id.includes('water'))layer.paint['fill-color']='#b4d5d0';else if(id.includes('landcover')||id.includes('landuse')||id.includes('park'))layer.paint['fill-color']='#d7e4d7';else if(id.includes('building'))layer.paint['fill-color']='#c3d3c8';}}
    map.setStyle(style);
  }).catch(e=>{if(e.name!=='AbortError'&&!disposed)setError('Basemap unavailable. Showing the georeferenced observations.');});
  return()=>{disposed=true;controller.abort();resize.disconnect();map.remove();mapRef.current=null;};
 // The case defines a map instance; each selected acquisition refreshes layers below.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[caseData.id]);
 useEffect(()=>{const map=mapRef.current;if(!map)return;setReady(false);let cancelled=false;const img=new Image();img.onload=()=>{if(cancelled)return;const source=map.getSource('plume') as maplibregl.ImageSource|undefined;if(source){source.updateImage({url:observation.asset.url,coordinates:observation.asset.coordinates as [[number,number],[number,number],[number,number],[number,number]]});const outline=map.getSource('outline') as maplibregl.GeoJSONSource;outline?.setData(observation.outline);const origin=map.getSource('origin') as maplibregl.GeoJSONSource;origin?.setData({type:'Feature',properties:{},geometry:{type:'Point',coordinates:observation.location}});}setReady(true);};img.onerror=()=>{if(!cancelled){setError('This acquisition image could not be loaded. Open the original record or try another date.');setReady(false);}};img.src=observation.asset.url;return()=>{cancelled=true;};},[observation]);
 useEffect(()=>{const m=mapRef.current;if(m?.getLayer('facility-points'))m.setLayoutProperty('facility-points','visibility',showFacilities?'visible':'none');},[showFacilities]);
 useEffect(()=>{const m=mapRef.current;if(!m||!camera)return;const c=m.getCenter();if(Math.abs(c.lng-camera.center[0])>1e-7||Math.abs(c.lat-camera.center[1])>1e-7||Math.abs(m.getZoom()-camera.zoom)>1e-5)m.jumpTo(camera);},[camera]);
 return <section className={'map-pane '+(highlight?'evidence-highlight':'')} aria-label={`Methane observation map, ${dateLabel(observation.date)}`}>
  <div ref={el} className="map-canvas" style={{visibility:ready?'visible':'hidden'}}/>
  {!ready&&!webglError&&<div className="map-loading"><LoaderCircle className="spin"/> Loading the dated observation…</div>}
  {webglError&&<div className="map-fallback"><img src={observation.asset.url} alt={`Methane enhancement on ${dateLabel(observation.date)}`}/><p>Interactive map unavailable. The original dated imagery is shown.</p></div>}
  <div className="map-date"><span className="date-dot"/>{dateLabel(observation.date,true)}<span>{observation.instrument}</span></div>
  <button className="recenter" onClick={fit}><Crosshair size={16}/> Recenter</button>
  <div className="map-legend"><strong>Methane column enhancement</strong><span>ppm·m</span><div className="cividis"/><small>0</small><small>{observation.asset.scale[1].toLocaleString()}</small><p>Transparent areas are not measured zeros.</p></div>
  {error&&<div className="map-error" role="status"><Info size={14}/>{error}</div>}
 </section>;
}
