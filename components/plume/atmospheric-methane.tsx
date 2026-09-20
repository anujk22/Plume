'use client';
import {useEffect,useState} from 'react';
import type {Map,MapSourceDataEvent,ErrorEvent} from 'maplibre-gl';
import manifest from '@/public/data/atmosphere/manifest.json';
import {registerAtmosphericTiles} from '@/lib/plume/atmospheric-tiles';
import {tintAtmosphericColor} from '@/lib/plume/atmospheric-palette';

export default function AtmosphericMethane({map,enabled,onEnabled,zoom}:{map:Map|null;enabled:boolean;onEnabled:(enabled:boolean)=>void;zoom:number}){
 const [providerColors,setProviderColors]=useState(false);
 const legend=manifest.colorStops.map(hex=>{const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));return providerColors?hex:`rgb(${tintAtmosphericColor(channels[0],channels[1],channels[2]).join(',')})`;}).join(',');
 const [period,setPeriod]=useState(manifest.periods[0].id),[status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const current=manifest.periods.find(p=>p.id===period)!;
 useEffect(()=>{
  if(!map)return;
  let failed=false;
  registerAtmosphericTiles();
  const install=()=>{
   if(map.getLayer('atmospheric-methane'))map.removeLayer('atmospheric-methane');
   if(map.getSource('atmospheric-methane'))map.removeSource('atmospheric-methane');
   if(!enabled)return;
   setStatus('loading');failed=false;
   map.addSource('atmospheric-methane',{type:'raster',tiles:[providerColors?`${location.origin}/api/atmosphere/${period}/{z}/{x}/{y}`:`plume-atmosphere://${period}/{z}/{x}/{y}`],scheme:'tms',tileSize:256,maxzoom:manifest.nativeTileZoom,attribution:'<a href="https://maps.s5p-pal.com/ch4/month/">Copernicus Sentinel-5P · S5P-PAL</a>'});
   const before=map.getStyle().layers.find(l=>l.type==='symbol'||['plume-raster','plume-contours','selected-footprint-fill','global-clusters'].includes(l.id))?.id;
   map.addLayer({id:'atmospheric-methane',type:'raster',source:'atmospheric-methane',maxzoom:9,paint:{'raster-opacity':['interpolate',['linear'],['zoom'],0,.72,7,.72,9,0],'raster-resampling':'linear','raster-fade-duration':250}},before);
  };
  const data=(e:MapSourceDataEvent)=>{if(e.sourceId==='atmospheric-methane'&&e.isSourceLoaded&&!failed)setStatus('ready');};
  const error=(e:ErrorEvent&{sourceId?:string})=>{if(e.sourceId==='atmospheric-methane'){failed=true;setStatus('error');}};
  map.on('style.load',install);map.on('sourcedata',data);map.on('error',error);
  if(map.getSource('atmospheric-methane')||map.getLayer('plume-origin')||map.getLayer('selected-origin')||map.isStyleLoaded())install();
  return()=>{map.off('style.load',install);map.off('sourcedata',data);map.off('error',error);};
 },[map,period,enabled,providerColors]);
 return <section className="atmospheric-control" aria-label="Regional atmospheric methane">
  <label><input type="checkbox" checked={enabled} onChange={e=>onEnabled(e.target.checked)}/> Atmospheric methane</label>
  {enabled&&<>
   {zoom<9&&<><span className="atmospheric-period-label">MEASUREMENT PERIOD · MONTHLY AVERAGE</span><select aria-label="Atmospheric measurement month" value={period} onChange={e=>setPeriod(e.target.value)}>{manifest.periods.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select>
   <div className="atmospheric-scale" style={{background:`linear-gradient(90deg,${legend})`}} aria-hidden="true"/><div className="atmospheric-ticks"><span>≤ 1,680</span><span>1,830</span><span>≥ 1,980</span></div></>}
   <p className="atmospheric-unit">Column methane · ppbv · monthly mean</p>
   <p role="status">{status==='error'?'Atmospheric tiles unavailable. Some areas may not have loaded.':zoom>=9?'Zoom out for regional methane. Plume detail is shown at this scale.':status==='loading'?'Loading monthly measurements…':'Gaps have no valid measurement.'}</p>
   <p className="atmospheric-history">Historical monthly average, not live. Three periods available; the case date filters do not change this layer.</p>
   <label className="atmospheric-palette-toggle"><input type="checkbox" checked={providerColors} onChange={e=>setProviderColors(e.target.checked)}/> Provider colors</label>
   <button className="atmospheric-regional" onClick={()=>map?.easeTo({zoom:6,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:600})}>Regional view ↗</button>
   <a href={current.downloadUrl} target="_blank" rel="noreferrer">Sentinel-5P / S5P-PAL source ↗</a>
  </>}
 </section>;
}
