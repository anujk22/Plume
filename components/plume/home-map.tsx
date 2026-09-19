'use client';
import {useEffect,useRef,useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import type {StyleSpecification,Map as MapInstance} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {Case,Observation} from '@/lib/plume/types';
maplibregl.setWorkerUrl('/workers/maplibre-gl-worker.mjs');
type Props={plumeAsset:{url:string;coordinates:number[][];bounds:number[]};observation:Observation;caseData:Case;methane:boolean;facilities:boolean;enhancement:boolean;recenter:number};
export default function HomeMap(props:Props){
 const container=useRef<HTMLDivElement>(null),map=useRef<MapInstance|null>(null),current=useRef(props);
 const [error,setError]=useState('');current.current=props;
 function frame(){const m=map.current;if(!m)return;const b=current.current.plumeAsset.bounds;const small=m.getContainer().clientWidth<550;m.fitBounds([[b[0],b[1]],[b[2],b[3]]],{padding:window.innerWidth<=760?{top:350,right:24,bottom:370,left:85}:small?{top:180,right:115,bottom:200,left:55}:{top:180,right:210,bottom:250,left:150},maxZoom:14.3,duration:0});}
 useEffect(()=>{
  if(!container.current)return;
  const controller=new AbortController();let disposed=false;let m:MapInstance;
  try{m=new maplibregl.Map({container:container.current,style:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#083b47'}}]},center:props.observation.location,zoom:12.2,interactive:false,attributionControl:false});}catch{setError('Map unavailable. Open the investigation to view the evidence.');return;}
  map.current=m;
  const resize=new ResizeObserver(()=>{m.resize();frame();});resize.observe(container.current);
  const render=()=>{
   const p=current.current,o=p.observation;
   m.addSource('enhancement',{type:'image',url:p.plumeAsset.url,coordinates:p.plumeAsset.coordinates as [[number,number],[number,number],[number,number],[number,number]]});
   m.addLayer({id:'enhancement',type:'raster',source:'enhancement',layout:{visibility:p.methane&&p.enhancement?'visible':'none'},paint:{'raster-resampling':'nearest','raster-fade-duration':0}});
   m.addSource('outline',{type:'geojson',data:o.outline});
   m.addLayer({id:'footprint',type:'fill',source:'outline',layout:{visibility:p.methane&&!p.enhancement?'visible':'none'},paint:{'fill-color':'#f5d76b','fill-opacity':.4}});
   m.addLayer({id:'outline',type:'line',source:'outline',layout:{visibility:p.methane?'visible':'none'},paint:{'line-color':'#f5d76b','line-width':1,'line-opacity':.45}});
   m.addSource('origin',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Point',coordinates:o.location}}});
   m.addLayer({id:'origin',type:'circle',source:'origin',layout:{visibility:p.methane?'visible':'none'},paint:{'circle-radius':7,'circle-color':'#ecbc56','circle-stroke-color':'#fff8d9','circle-stroke-width':3}});
   m.addSource('facilities',{type:'geojson',data:{type:'FeatureCollection',features:(p.caseData.facilities||[]).map(f=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates:f.location}}))}});
   m.addLayer({id:'facilities',type:'circle',source:'facilities',layout:{visibility:p.facilities?'visible':'none'},paint:{'circle-radius':8,'circle-color':'#b7d8cd','circle-stroke-color':'#fff','circle-stroke-width':2}});
  };
  m.on('style.load',()=>{render();frame();});
  fetch('https://tiles.openfreemap.org/styles/liberty',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json() as Promise<StyleSpecification>;}).then(style=>{
   if(disposed)return;
   style.layers=style.layers.filter(l=>l.type!=='fill-extrusion'&&l.type!=='symbol');
   for(const l of style.layers){if(l.type==='background')l.paint={'background-color':'#083b47'};if(l.type==='fill'){l.paint={...l.paint,'fill-color':l.id.includes('water')?'#105260':l.id.includes('building')?'#24626a':'#124651','fill-opacity':1};delete l.paint['fill-pattern'];}if(l.type==='line')l.paint={...l.paint,'line-color':l.id.includes('motorway')?'#729481':'#39727a','line-opacity':.7};}
   m.setStyle(style);
  }).catch(e=>{if(!disposed&&e.name!=='AbortError')setError('Basemap unavailable. The dated plume outline is still shown.');});
  return()=>{disposed=true;controller.abort();resize.disconnect();m.remove();map.current=null;};
 // A stable map instance receives date and display changes below.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{const m=map.current;if(!m?.getSource('outline'))return;const o=props.observation;(m.getSource('outline') as maplibregl.GeoJSONSource).setData(o.outline);(m.getSource('enhancement') as maplibregl.ImageSource).updateImage({url:props.plumeAsset.url,coordinates:props.plumeAsset.coordinates as [[number,number],[number,number],[number,number],[number,number]]});(m.getSource('origin') as maplibregl.GeoJSONSource).setData({type:'Feature',properties:{},geometry:{type:'Point',coordinates:o.location}});m.setLayoutProperty('footprint','visibility',props.methane&&!props.enhancement?'visible':'none');for(const id of ['outline','origin'])m.setLayoutProperty(id,'visibility',props.methane?'visible':'none');m.setLayoutProperty('enhancement','visibility',props.methane&&props.enhancement?'visible':'none');m.setLayoutProperty('facilities','visibility',props.facilities?'visible':'none');frame();},[props.observation,props.plumeAsset,props.methane,props.facilities,props.enhancement,props.recenter]);
 return <><div ref={container} className="home-map-canvas" aria-label="Geographic map of the selected Newby Island observation"/>{error&&<p className="home-map-error" role="status">{error}</p>}</>;
}
