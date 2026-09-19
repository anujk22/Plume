import Link from 'next/link';
import { ArrowRight, Layers3, ScanLine, FileCheck2, MoveUpRight } from 'lucide-react';
import { Brand } from '@/components/plume/brand';

export default function Home() {
  return <main className="landing">
    <div className="landscape" aria-hidden="true" />
    <header className="landing-header"><Brand /><nav aria-label="Main navigation"><Link href="/explore">Explore</Link><Link href="/method">Our method</Link><Link href="/explore" className="pill primary">Follow the evidence <ArrowRight size={17}/></Link></nav></header>
    <section className="hero-copy">
      <p className="eyebrow">METHANE OBSERVATIONS, IN CONTEXT</p>
      <h1>Plume</h1>
      <h2>See the observations.<br/>Follow the evidence.</h2>
      <p className="hero-description">Explore satellite observations. Understand their limits.<br className="desktop-break"/> Take the evidence with you.</p>
      <Link href="/investigations/yemen-area" className="explore-link"><span><span className="explore-kicker">START WITH A REAL INVESTIGATION</span><strong>Two dates. A clearer picture.</strong></span><span className="circle"><ArrowRight size={23}/></span></Link>
      <div className="hero-benefits"><div><ScanLine/><strong>Real observations</strong><span>Published satellite evidence</span></div><div><Layers3/><strong>Every record connected</strong><span>See what counts, and why</span></div><div><FileCheck2/><strong>Evidence to take away</strong><span>A brief you can verify</span></div></div>
    </section>
    <section className="hero-evidence" aria-label="Preview of a real satellite observation">
      <div className="preview-heading"><span className="live-dot"/> A REAL OBSERVATION <span className="preview-coord">15.586° N · 46.036° E</span></div>
      <div className="raster-preview"><div className="coordinate-grid" aria-hidden="true"/><img src="/data/plume-2026-09-19/emi20240420t101448p07050-A.png" alt="Actual EMIT methane enhancement raster observed on 20 April 2024 in Yemen"/><span className="preview-date">20 APR 2024 <span>EMIT</span></span><span className="preview-location">Marib region<br/><strong>Yemen</strong></span></div>
      <div className="preview-legend"><span>Methane column enhancement</span><span>ppm·m</span><div className="cividis"/><small>0</small><small>5,500</small></div>
      <div className="preview-finding"><div><p className="eyebrow">THE EVIDENCE, NOT THE ASSUMPTION</p><h3>Two observations.<br/>An open question.</h3><p>Detected on two dates. Continuous emissions<br/>and the emitting facility remain unproven.</p></div><Link className="circle" href="/investigations/yemen-area" aria-label="Open the Yemen investigation"><MoveUpRight size={21}/></Link></div>
      <p className="preview-credit">Source: Carbon Mapper · EMIT instrument · Historical observations</p>
    </section>
    <footer className="landing-footer"><span>ONE PLANET.<br/>A CLEARER PICTURE.</span><Link href="/method">Published evidence. Thoughtfully connected. <ArrowRight size={15}/></Link></footer>
  </main>;
}
