'use client';
import {useEffect,useState} from 'react';
import {Globe2,X,ArrowUpRight} from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import type {FeatureCollection,Point} from 'geojson';
import manifest from '@/public/data/global-methane/manifest.json';
import {dateLabel} from '@/lib/plume/evidence';

type RecordProperties={id:string;date:string;scenes:string;peak:number;download:string};
type Catalog=FeatureCollection<Point,RecordProperties>;
let catalogRequest:Promise<Catalog>|undefined;
function loadCatalog(){
 return catalogRequest??=(fetch('/data/global-methane/points.geojson').then(r=>{if(!r.ok)throw new Error('Catalog unavailable');return r.json() as Promise<Catalog>;}).catch(e=>{catalogRequest=undefined;throw e;}));
}
const layerIds=['global-footprints','global-footprint-edges','global-clusters','global-counts','global-points'];
export default function GlobalDetections({map}:{map:maplibregl.Map|null}){
 const [viewRecords,setViewRecords]=useState<RecordProperties[]>([]);
 const [enabled,setEnabled]=useState(true),[catalog,setCatalog]=useState<Catalog|null>(null),[error,setError]=useState(false),[visible,setVisible]=useState(0),[selected,setSelected]=useState<RecordProperties|null>(null);
 useEffect(()=>{let cancelled=false;loadCatalog().then(data=>{if(!cancelled)setCatalog(data);}).catch(()=>{if(!cancelled)setError(true);});return()=>{cancelled=true;};},[]);
 useEffect(()=>{
  if(!map||!catalog)return;
  let disposed=false;
  const countVisible=()=>{const bounds=map.getBounds();const records=catalog.features.filter(f=>{const [lng,lat]=f.geometry.coordinates;return lat>=bounds.getSouth()&&lat<=bounds.getNorth()&&[lng-360,lng,lng+360].some(x=>x>=bounds.getWest()&&x<=bounds.getEast());});setVisible(records.length);setViewRecords(records.map(f=>f.properties).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8));};
  const addFootprints=()=>{
   if(!enabled||map.getZoom()<9||!map.getSource('global-detections')||map.getSource('global-footprints'))return;
   map.addSource('global-footprints',{type:'geojson',data:'/data/global-methane/outlines.geojson'});
   map.addLayer({id:'global-footprints',type:'fill',source:'global-footprints',minzoom:9,paint:{'fill-color':'#cf774b','fill-opacity':.08}},'global-clusters');
   map.addLayer({id:'global-footprint-edges',type:'line',source:'global-footprints',minzoom:9,paint:{'line-color':'#af6744','line-width':1,'line-opacity':.65}},'global-clusters');
  };
  const install=()=>{
   if(!map.getSource('global-detections')){
    map.addSource('global-detections',{type:'geojson',data:catalog,cluster:true,clusterRadius:32,clusterMaxZoom:11});
    map.addLayer({id:'global-clusters',type:'circle',source:'global-detections',filter:['has','point_count'],paint:{'circle-color':'#bb673c','circle-radius':['step',['get','point_count'],15,10,20,100,26],'circle-stroke-color':'#fff8df','circle-stroke-width':2,'circle-opacity':.93}});
    if(map.getStyle().glyphs)map.addLayer({id:'global-counts',type:'symbol',source:'global-detections',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':12},paint:{'text-color':'#fff9e9'}});
    map.addLayer({id:'global-points',type:'circle',source:'global-detections',filter:['!',['has','point_count']],paint:{'circle-color':'#db9050','circle-radius':['interpolate',['linear'],['zoom'],2,3,10,5,14,7],'circle-stroke-color':'#fff9e9','circle-stroke-width':1.5}});
   }
   addFootprints();
   for(const id of layerIds)if(map.getLayer(id))map.setLayoutProperty(id,'visibility',enabled?'visible':'none');
   countVisible();
  };
  const move=()=>{countVisible();addFootprints();};
  const clickPoint=(e:maplibregl.MapLayerMouseEvent)=>{const id=e.features?.[0]?.properties.id;const record=catalog.features.find(f=>f.properties.id===id);if(record)setSelected(record.properties);};
  const clickCluster=async(e:maplibregl.MapLayerMouseEvent)=>{const f=e.features?.[0];if(!f||f.geometry.type!=='Point')return;const source=map.getSource('global-detections') as maplibregl.GeoJSONSource;const zoom=await source.getClusterExpansionZoom(f.properties.cluster_id);if(!disposed)map.easeTo({center:f.geometry.coordinates as [number,number],zoom,duration:400});};
  const enter=()=>{map.getCanvas().style.cursor='pointer';};const leave=()=>{map.getCanvas().style.cursor='';};
  map.on('style.load',install);map.on('moveend',move);
  map.on('click','global-points',clickPoint);map.on('click','global-clusters',clickCluster);
  for(const id of ['global-points','global-clusters']){map.on('mouseenter',id,enter);map.on('mouseleave',id,leave);}
  // Parent evidence layers exist only after style.load, even while tiles are still loading.
  if(map.getSource('global-detections')||map.getLayer('plume-origin')||map.getLayer('selected-origin')||map.isStyleLoaded())install();
  return()=>{disposed=true;map.off('style.load',install);map.off('moveend',move);map.off('click','global-points',clickPoint);map.off('click','global-clusters',clickCluster);for(const id of ['global-points','global-clusters']){map.off('mouseenter',id,enter);map.off('mouseleave',id,leave);}};
 },[map,catalog,enabled]);
 function showWorld(){
  if(!map)return;
  const workspace=map.getContainer().closest('.workspace');
  const desktop=window.innerWidth>=1200;
  const left=workspace?.querySelector('.case-rail,.place-filters')?.clientWidth||280;
  const right=workspace?.querySelector('.findings-panel,.place-results')?.clientWidth||360;
  map.fitBounds([[-180,-55],[180,75]],{padding:desktop?{top:100,bottom:200,left:left+65,right:right+65}:55,duration:600});
 }
 return <aside className="global-detections" aria-label="Worldwide methane catalog">
  <div className="global-catalog-heading"><Globe2 size={16}/><strong>Beyond this investigation</strong></div>
  <label><input type="checkbox" checked={enabled} onChange={e=>{setEnabled(e.target.checked);setSelected(null);}}/> Published hotspots worldwide</label>
  <p role="status">{error?'NASA catalog unavailable.':catalog?`${enabled?visible.toLocaleString():0} in view · ${manifest.count.toLocaleString()} in catalog`:'Loading NASA detections…'}</p>
  <div className="global-catalog-actions"><span>NASA EMIT · 2022–2025</span><button onClick={showWorld}><Globe2 size={13}/> World view</button></div>
  {enabled&&viewRecords.length>0&&!selected&&<details className="global-record-list"><summary>Browse recent records in view</summary><p>Up to eight most recent records</p>{viewRecords.map(record=><button key={record.id} onClick={()=>setSelected(record)}><span>{dateLabel(record.date,true)}</span><small>{record.peak.toLocaleString()} ppm·m peak</small></button>)}</details>}
  {selected&&enabled?<div className="global-record"><button className="global-record-close" onClick={()=>setSelected(null)} aria-label="Close hotspot details"><X size={14}/></button><span className="eyebrow">NASA PUBLISHED DETECTION</span><h3>{dateLabel(selected.date,true)}</h3><dl><div><dt>Peak column enhancement</dt><dd>{selected.peak.toLocaleString()} ppm·m</dd></div><div><dt>Plume record</dt><dd>{selected.id}</dd></div></dl><p>Point marks the maximum measured enhancement; the outline is the published footprint. It does not identify the emitting facility.</p><button className="global-zoom-record" onClick={()=>{const point=catalog?.features.find(f=>f.properties.id===selected.id);if(point)map?.easeTo({center:point.geometry.coordinates as [number,number],zoom:13,duration:500});}}>Zoom to this hotspot <ArrowUpRight size={13}/></button><a href={selected.download} target="_blank" rel="noreferrer">NASA source data <ArrowUpRight size={13}/></a><small>Earthdata sign-in may be required. This record is not added to the case brief.</small></div>:<small>Amber markers locate detections; numbers count records, not emission rates. All catalog dates; separate from the case timeline. <a href="/method#coverage">Coverage & sources</a></small>}
 </aside>;
}
