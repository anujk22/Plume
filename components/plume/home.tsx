'use client';
import Link from 'next/link';
import {ArrowRight,Search,Leaf,Layers3,Users,Map as MapIcon,Waves,FileText,SplitSquareHorizontal,ArrowUpRight} from 'lucide-react';
import {Brand} from './brand';
import {useSnapshot} from './use-snapshot';
import {PlaceSearch} from './place-search';
export default function Home(){
 const {snapshot,error}=useSnapshot();
 const investigation='/investigations/newby-island';
 return <main className="landing illustrated-landing">
  <div className="landscape" aria-hidden="true"/>
  <header className="landing-header"><Brand/><nav aria-label="Main navigation"><Link href="/method#reading">About</Link><Link href="/explore">Evidence</Link><Link href="/method">Methodology</Link><Link href="/method#sources">Sources</Link><Link href="/explore" className="pill primary">Explore the map <ArrowRight size={16}/></Link></nav></header>
  <section className="hero-copy">
   <p className="eyebrow">SEE THE OBSERVATIONS. FOLLOW THE EVIDENCE.</p><h1>Plume</h1>
   <h2>See methane. Understand the evidence.<br/>A clearer picture starts here.</h2>
   {snapshot?<PlaceSearch snapshot={snapshot} variant="hero"/>:<button className="home-search" disabled><Search size={23}/><span>Search a city, region, or ZIP code…</span><span className="circle"><ArrowRight size={22}/></span></button>}
   <div className="hero-benefits"><div><Leaf/><strong>Real data</strong><span>From satellites<br/>to the source</span></div><div><Layers3/><strong>Bigger context</strong><span>See what the<br/>evidence supports</span></div><div><Users/><strong>Shared understanding</strong><span>A brief anyone<br/>can explore</span></div></div>
  </section>
  <p className="home-margin-note" aria-hidden="true">SEARCH<br/>EXPLORE<br/>UNDERSTAND<br/>FOLLOW THE EVIDENCE<span/></p>
  <section className="home-map-area" aria-label="Illustrated introduction to Plume">
   {snapshot?<PlaceSearch snapshot={snapshot} variant="compact"/>:<button className="home-place" disabled><Search size={22}/><span>Find an investigation</span><ArrowRight size={17}/></button>}
   <nav className="home-map-tools" aria-label="Explore Plume"><Link href={investigation}><MapIcon/><span>Map</span></Link><Link className="home-tool-featured" href="/method#reading"><Waves/><span>Methane</span></Link><Link href={investigation+'?view=compare'}><SplitSquareHorizontal/><span>Compare</span></Link><Link href="/method#sources"><Layers3/><span>Sources</span></Link></nav>
   <div className="home-illustration-note"><span className="illustration-dot"/><div><strong>Illustrated landscape</strong><span>Not measured methane data</span></div></div>
   <Link className="home-rate-card home-discovery-card" href={investigation}><Waves/><div><span>Satellite observations</span><strong>Real evidence.</strong></div><FileText/><div><span>Original records, in context</span><p>Explore a real case <ArrowRight size={16}/></p></div></Link>
   <Link className="home-story" href={investigation}><div className="home-story-thumbnail home-art-thumbnail" aria-hidden="true"/><div className="home-story-copy"><h3>Visible evidence.<br/>A clearer picture.</h3><p>Explore methane observations,<br/>connect the records, and understand more.</p></div><span className="home-story-action"><span className="circle"><ArrowRight size={20}/></span></span></Link>
   <p className="home-source">Concept artwork · <Link href={investigation}>Explore the measured observations <ArrowUpRight size={11}/></Link></p>
   {error&&<p className="home-load-error" role="alert">Place search is unavailable. <Link href="/explore">Open investigations</Link></p>}
  </section>
  <footer className="landing-footer"><span>SAME PLANET.<br/>A CLEARER PICTURE.<i/></span><span>PEOPLE<br/>PLACES<br/>PERSPECTIVE<i/></span></footer>

 </main>;
}
