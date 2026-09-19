'use client';
import {useState} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {ArrowRight,Search,Leaf,Layers3,Users,Map as MapIcon,Waves,Factory,ChartNoAxesColumnIncreasing,Plus,X} from 'lucide-react';
import {Brand} from './brand';
import {useSnapshot} from './use-snapshot';
import {PlaceSearch} from './place-search';
import plumes from '@/public/data/home-plumes/manifest.json';
import {dateLabel} from '@/lib/plume/evidence';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
const HomeMap=dynamic(()=>import('./home-map'),{ssr:false});
export default function Home(){
 const {snapshot,error}=useSnapshot();
 const [search,setSearch]=useState(false),[layers,setLayers]=useState(false),[methane,setMethane]=useState(true),[facilities,setFacilities]=useState(false),[enhancement,setEnhancement]=useState(true),[index,setIndex]=useState(1),[recenter,setRecenter]=useState(0);
 const caseData=snapshot?.cases.find(c=>c.id==='newby-island');
 const observations=snapshot?.observations.filter(o=>o.caseId==='newby-island')||[];
 const observation=observations[index];
 const plume=plumes[observation?.id as keyof typeof plumes];
 const investigation='/investigations/newby-island'+(observation?'?observation='+observation.id:'');
 return <main className="landing">
  <div className="landscape" aria-hidden="true"/>
  <header className="landing-header"><Brand/><nav aria-label="Main navigation"><Link href="/method#reading">About</Link><Link href="/explore">Evidence</Link><Link href="/method">Methodology</Link><Link href="/method#sources">Sources</Link><Link href="/explore" className="pill primary">Explore the map <ArrowRight size={16}/></Link></nav></header>
  <section className="hero-copy">
   <p className="eyebrow">SEE THE OBSERVATIONS. FOLLOW THE EVIDENCE.</p><h1>Plume</h1>
   <h2>See methane. Understand the evidence.<br/>A clearer picture starts here.</h2>
   <button className="home-search" disabled={!snapshot} onClick={()=>setSearch(true)}><Search size={23}/><span>Search a city, region, or ZIP code…</span><span className="circle"><ArrowRight size={22}/></span></button>
   <div className="hero-benefits"><div><Leaf/><strong>Real data</strong><span>From satellites<br/>to the source</span></div><div><Layers3/><strong>Bigger context</strong><span>See what the<br/>evidence supports</span></div><div><Users/><strong>Shared understanding</strong><span>A brief anyone<br/>can explore</span></div></div>
  </section>
  <p className="home-margin-note" aria-hidden="true">SEARCH<br/>EXPLORE<br/>UNDERSTAND<br/>FOLLOW THE EVIDENCE<span/></p>
  <section className="home-map-area" aria-label="Explore a real methane observation">
   <div className="home-map-surface">{caseData&&observation&&plume&&<HomeMap observation={observation} plumeAsset={plume} caseData={caseData} methane={methane} facilities={facilities} enhancement={enhancement} recenter={recenter}/>}</div>
   <button className="home-place" disabled={!snapshot} onClick={()=>setSearch(true)}><Search size={22}/><span>Newby Island, CA</span><ArrowRight size={17}/></button>
   <nav className="home-dates" aria-label="Preview observation date"><span>OBSERVED IN 2024</span><div>{observations.map((o,i)=><button key={o.id} aria-label={'Preview '+dateLabel(o.date)} aria-pressed={index===i} onClick={()=>{setIndex(i);setMethane(true);}}>{dateLabel(o.date,true).replace(' 2024','')}</button>)}</div></nav>
   <div className="home-map-tools" aria-label="Map controls"><button onClick={()=>setRecenter(v=>v+1)} aria-label="Recenter preview map"><MapIcon/><span>Map</span></button><button aria-pressed={methane} onClick={()=>setMethane(v=>!v)}><Waves/><span>Methane</span></button><button aria-pressed={facilities} onClick={()=>setFacilities(v=>!v)}><Factory/><span>Facilities</span></button><button aria-expanded={layers} aria-controls="home-layers" onClick={()=>setLayers(v=>!v)}><Layers3/><span>Layers</span></button></div>
   {layers&&<div id="home-layers" className="home-layer-panel"><strong>Dated observations</strong><button className="home-layer-close" aria-label="Close layers" onClick={()=>setLayers(false)}><X size={16}/></button>{observations.map((o,i)=><button key={o.id} aria-pressed={index===i} onClick={()=>setIndex(i)}>{dateLabel(o.date)}<span>EMIT</span></button>)}<label><input type="checkbox" checked={enhancement} onChange={e=>setEnhancement(e.target.checked)}/> Show enhancement imagery</label></div>}
   <div className="home-legend">{!methane?<><strong>Methane layer hidden</strong><button className="home-show-methane" onClick={()=>setMethane(true)}>Show the observation <ArrowRight size={13}/></button></>:enhancement?<><strong>Methane enhancement</strong><span className="home-legend-unit">Column enhancement · ppm·m</span><div className="cividis"/><div className="home-scale"><span>0</span><span>4,500</span><span>9,000</span></div></>:<><strong>Observed methane</strong><span className="home-footprint-key"><i/> Published plume outline</span></>}<small>{observation?dateLabel(observation.date)+' · EMIT':'Loading observation…'}</small></div>
   <Link className="home-rate-card" href={investigation}><ChartNoAxesColumnIncreasing/><div><span>Plume rate · single acquisition</span><strong>{observation?.rate!=null?(observation.rate/1000).toFixed(2)+' t/hr':'Rate unavailable'}</strong><small>{observation?.uncertainty!=null?'± '+(observation.uncertainty/1000).toFixed(2)+' t/hr · provider estimate':''}</small></div><Plus/><div><span>Source attribution</span><p>Unresolved <ArrowRight size={15}/></p></div></Link>
   <Link className="home-story" href={investigation}><div className="home-story-thumbnail">{plume&&<img src={plume.url} alt="Actual provider-masked methane enhancement"/>}</div><div className="home-story-copy"><span className="home-story-kicker">NEWBY ISLAND · CALIFORNIA</span><h3>Three dates.<br/>One investigation.</h3><p>Compare the observations.<br/>See what the evidence supports.</p></div><span className="home-story-action"><span className="circle"><ArrowRight size={20}/></span><span>Explore case</span></span></Link>
   <p className="home-source">Source: <a href="https://carbonmapper.org/terms">Carbon Mapper</a> · Historical observations, 2024<br/><a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a></p>
   {error&&<p className="home-load-error" role="alert">The observation could not load. <Link href="/explore">Open investigations</Link></p>}
  </section>
  <footer className="landing-footer"><span>SAME PLANET.<br/>A CLEARER PICTURE.<i/></span><span>PEOPLE<br/>PLACES<br/>PERSPECTIVE<i/></span></footer>
  <Sheet open={search} onOpenChange={setSearch}><SheetContent className="plume-sheet"><SheetHeader><SheetTitle>Find a place</SheetTitle><SheetDescription>Search geography and discover the investigations included in this snapshot.</SheetDescription></SheetHeader><div className="sheet-body">{snapshot?<PlaceSearch snapshot={snapshot}/>:<p>{error||'Loading the included investigations…'}</p>}</div></SheetContent></Sheet>
 </main>;
}
