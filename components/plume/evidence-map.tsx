'use client';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {FeatureCollection} from 'geojson';
import type {Map as MapInstance,StyleSpecification} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Crosshair, Info, LoaderCircle} from 'lucide-react';
import plumes from '@/public/data/investigation-plumes/manifest.json';
import {dateLabel} from '@/lib/plume/evidence';
import type {Case,Observation} from '@/lib/plume/types';

type Camera={center:[number,number];zoom:number};
maplibregl.setWorkerUrl('/workers/maplibre-gl-worker.mjs');
const baseStyle:StyleSpecification={version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#d5e4d8'}}]};
export default function EvidenceMap({observation,allObservations,caseData,highlight=false,showFacilities=true,camera,onCamera,showScene=false,immersive=false,showMethane=true,sensorPixels=false}:{observation:Observation;allObservations:Observation[];caseData:Case;highlight?:boolean;showFacilities?:boolean;camera?:Camera;onCamera?:(c:Camera)=>void;showScene?:boolean;immersive?:boolean;showMethane?:boolean;sensorPixels?:boolean}){
 const el=useRef<HTMLDivElement>(null),mapRef=useRef<MapInstance|null>(null),selection=useRef(observation),facilities=useRef(showFacilities),cameraHandler=useRef(onCamera);
 const [error,setError]=useState(''),[ready,setReady]=useState(false),[webglError,setWebglError]=useState(false);
 const asset=showScene?observation.asset:plumes[observation.id as keyof typeof plumes];
 const contour=plumes[observation.id as keyof typeof plumes];
 const useContours=!showScene&&!sensorPixels;
 const contourMode=useRef(useContours);contourMode.current=useContours;
 const displayAsset=useRef(asset);displayAsset.current=asset;
 const methaneVisible=useRef(showMethane);methaneVisible.current=showMethane;
 const bounds=(immersive?[observation]:allObservations).map(o=>showScene?o.asset:plumes[o.id as keyof typeof plumes]).reduce((b,asset)=>[Math.min(b[0],asset.bounds[0]),Math.min(b[1],asset.bounds[1]),Math.max(b[2],asset.bounds[2]),Math.max(b[3],asset.bounds[3])],[180,90,-180,-90]);
 selection.current=observation;facilities.current=showFacilities;cameraHandler.current=onCamera;
 function fit(){const m=mapRef.current;if(!m)return;const workspace=el.current?.closest('.workspace');const full=immersive&&window.innerWidth>=1200;const left=workspace?.querySelector('.case-rail')?.clientWidth||280;const right=workspace?.querySelector('.findings-panel')?.clientWidth||360;m.fitBounds([[bounds[0],bounds[1]],[bounds[2],bounds[3]]],{padding:full?{top:140,bottom:205,left:left+65,right:right+65}:65,duration:0,maxZoom:14});}
 const fitRef=useRef(fit);fitRef.current=fit;
 useEffect(()=>{
  if(!el.current)return;let disposed=false;const controller=new AbortController();let map:MapInstance;
  try{map=new maplibregl.Map({container:el.current,style:baseStyle,center:caseData.location,zoom:12,attributionControl:{compact:true,customAttribution:'Source: <a href="https://carbonmapper.org/terms" target="_blank" rel="noopener">Carbon Mapper</a>'},canvasContextAttributes:{preserveDrawingBuffer:false}});}catch{setWebglError(true);return;}
  mapRef.current=map;const resize=new ResizeObserver(()=>{map.resize();fitRef.current();});resize.observe(el.current);map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');map.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  map.on('moveend',()=>{const p=map.getCenter();cameraHandler.current?.({center:[p.lng,p.lat],zoom:map.getZoom()});});
  const renderLayers=()=>{
    if(disposed)return;const o=selection.current;
    for(const id of ['plume-origin','facility-labels','facility-points','plume-outline','plume-raster','plume-contours','plume-contour-lines'])if(map.getLayer(id))map.removeLayer(id);
    for(const id of ['plume','contours','outline','origin','facilities'])if(map.getSource(id))map.removeSource(id);
    map.addSource('plume',{type:'image',url:displayAsset.current.url,coordinates:displayAsset.current.coordinates as [[number,number],[number,number],[number,number],[number,number]]});
    map.addLayer({id:'plume-raster',type:'raster',source:'plume',paint:{'raster-opacity':1,'raster-resampling':'nearest','raster-fade-duration':0}});
    map.addSource('contours',{type:'geojson',data:plumes[o.id as keyof typeof plumes].contoursUrl});
    map.addLayer({id:'plume-contours',type:'fill',source:'contours',paint:{'fill-color':['get','color'],'fill-opacity':.96}});
    map.addLayer({id:'plume-contour-lines',type:'line',source:'contours',paint:{'line-color':'#ffe2a5','line-width':.5,'line-opacity':.25}});
    map.addSource('outline',{type:'geojson',data:o.outline});map.addLayer({id:'plume-outline',type:'line',source:'outline',paint:{'line-color':'#708d78','line-width':1.4,'line-opacity':.35}});
    map.addSource('origin',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Point',coordinates:o.location}}});
    map.addLayer({id:'plume-origin',type:'circle',source:'origin',paint:{'circle-radius':6,'circle-color':'#ffffff','circle-stroke-width':3,'circle-stroke-color':'#0a545a'}});
    if(caseData.facilities?.length){map.addSource('facilities',{type:'geojson',data:{type:'FeatureCollection',features:caseData.facilities.map(f=>({type:'Feature',properties:{name:f.name},geometry:{type:'Point',coordinates:f.location}}))}});map.addLayer({id:'facility-points',type:'circle',source:'facilities',layout:{visibility:facilities.current?'visible':'none'},paint:{'circle-radius':6,'circle-color':'#76627d','circle-stroke-color':'#fff','circle-stroke-width':2}});}
  };
  map.on('style.load',()=>{renderLayers();for(const id of ['plume-raster','plume-outline','plume-origin'])map.setLayoutProperty(id,'visibility',methaneVisible.current?'visible':'none');map.setLayoutProperty('plume-raster','visibility',methaneVisible.current&&!contourMode.current?'visible':'none');for(const id of ['plume-contours','plume-contour-lines'])map.setLayoutProperty(id,'visibility',methaneVisible.current&&contourMode.current?'visible':'none');});map.on('load',()=>{fitRef.current();setReady(true);});
  map.on('error',()=>{if(!disposed)setError('Some map detail is unavailable. The dated evidence remains accessible.');});
  fetch('https://tiles.openfreemap.org/styles/liberty',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<StyleSpecification>;}).then((style)=>{
    if(disposed)return;
    style.layers=style.layers.filter(l=>l.type!=='fill-extrusion'&&!(l.type==='symbol'&&l.layout?.['icon-image']&&!l.layout?.['text-field']));
    for(const layer of style.layers){
      const id=layer.id.toLowerCase();
      if(layer.type==='background')layer.paint={'background-color':'#d5e4d8'};
      if(layer.type==='fill'){layer.paint={...layer.paint,'fill-color':id.includes('water')?'#9fc9c5':id.includes('building')?'#b3cbbf':id.includes('park')?'#b8d0b9':'#d5e4d8'};delete layer.paint['fill-pattern'];}
      if(layer.type==='line'&&/road|motorway|highway|path|bridge|tunnel/.test(id))layer.paint={...layer.paint,'line-color':id.includes('casing')?'#a8bfb2':'#f7f5e7'};
      if(layer.type==='symbol')layer.paint={...layer.paint,'text-color':'#365e61','text-halo-color':'#edf3e8'};
    }
    map.setStyle(style);
  }).catch(e=>{if(e.name!=='AbortError'&&!disposed)setError('Basemap unavailable. Showing the georeferenced observations.');});
  return()=>{disposed=true;controller.abort();resize.disconnect();map.remove();mapRef.current=null;};
 // The case defines a map instance; each selected acquisition refreshes layers below.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[caseData.id]);
 useEffect(()=>{const map=mapRef.current;if(!map)return;setReady(false);let cancelled=false;const img=new Image();img.onload=async()=>{let geometry;try{if(useContours){const response=await fetch(contour.contoursUrl);if(!response.ok)throw new Error();geometry=await response.json() as FeatureCollection;}}catch{if(!cancelled){setError('Contour imagery unavailable. Open the original record.');setReady(false);}return;}if(cancelled)return;if(geometry)(map.getSource('contours') as maplibregl.GeoJSONSource|undefined)?.setData(geometry);const source=map.getSource('plume') as maplibregl.ImageSource|undefined;if(source){source.updateImage({url:asset.url,coordinates:asset.coordinates as [[number,number],[number,number],[number,number],[number,number]]});const outline=map.getSource('outline') as maplibregl.GeoJSONSource;outline?.setData(observation.outline);const origin=map.getSource('origin') as maplibregl.GeoJSONSource;origin?.setData({type:'Feature',properties:{},geometry:{type:'Point',coordinates:observation.location}});}setReady(true);};img.onerror=()=>{if(!cancelled){setError('This acquisition image could not be loaded. Open the original record or try another date.');setReady(false);}};img.src=asset.url;return()=>{cancelled=true;};},[observation,asset,contour,useContours]);
 useEffect(()=>{const m=mapRef.current;for(const id of ['plume-raster','plume-outline','plume-origin','plume-contours','plume-contour-lines'])if(m?.getLayer(id)){const enabled=showMethane&&(id==='plume-raster'?!useContours:id.startsWith('plume-contour')?useContours:true);m.setLayoutProperty(id,'visibility',enabled?'visible':'none');}},[showMethane,useContours]);
 useEffect(()=>{fitRef.current();},[showScene,immersive,observation]);
 useEffect(()=>{const m=mapRef.current;if(m?.getLayer('facility-points'))m.setLayoutProperty('facility-points','visibility',showFacilities?'visible':'none');},[showFacilities]);
 useEffect(()=>{const m=mapRef.current;if(!m||!camera)return;const c=m.getCenter();if(Math.abs(c.lng-camera.center[0])>1e-7||Math.abs(c.lat-camera.center[1])>1e-7||Math.abs(m.getZoom()-camera.zoom)>1e-5)m.jumpTo(camera);},[camera]);
 return <section className={'map-pane '+(highlight?'evidence-highlight':'')} aria-label={`Methane observation map, ${dateLabel(observation.date)}`}>
  <div ref={el} className="map-canvas" style={{visibility:ready?'visible':'hidden'}}/>
  {!ready&&!webglError&&<div className="map-loading"><LoaderCircle className="spin"/> Loading the dated observation…</div>}
  {webglError&&<div className="map-fallback"><img src={useContours?contour.previewUrl:asset.url} alt={`Methane enhancement on ${dateLabel(observation.date)}`}/><p>Interactive map unavailable. The selected dated visualization is shown.</p></div>}
  <div className="map-date"><span className="date-dot"/>{dateLabel(observation.date,true)}<span>{observation.instrument}</span><span>{useContours?'Derived contours':'Sensor pixels'}</span></div>
  <button className="recenter" onClick={fit}><Crosshair size={16}/> Recenter</button>
  <div className="map-legend"><strong>Methane column enhancement</strong><span>ppm·m</span><div className={showScene?"cividis":"inferno-scale"}/><small>0</small><small>{observation.asset.scale[1].toLocaleString()}</small><p>{useContours?'Interpolated bands within measured cells.':'Original sensor samples.'} Empty areas are not measured zeros.</p></div>
  {error&&<div className="map-error" role="status"><Info size={14}/>{error}</div>}
 </section>;
}
