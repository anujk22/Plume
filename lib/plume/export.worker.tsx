/// <reference lib="webworker" />
import React from 'react';
import {Document,Page,Text,View,Image,Link,Font,StyleSheet,pdf} from '@react-pdf/renderer';
import {zipSync,strToU8} from 'fflate';
import {assess,canonicalize,dateCounts,dateLabel,findings,selectObservations,sha256} from './evidence';
import {validateSnapshot} from './validate';
import type {EvidenceInput,Snapshot} from './types';

const styles=StyleSheet.create({
 page:{paddingTop:36,paddingBottom:55,paddingHorizontal:42,fontFamily:'PlumeSans',fontSize:10,color:'#073641',backgroundColor:'#fbfcf7',lineHeight:1.5},
 top:{flexDirection:'row',justifyContent:'space-between',borderBottom:1,borderColor:'#b8cfca',paddingBottom:12,marginBottom:16},
 logo:{fontFamily:'PlumeSerif',fontSize:28},eyebrow:{fontSize:8,letterSpacing:1.5,color:'#517774',marginBottom:8},
 title:{fontFamily:'PlumeSerif',fontSize:30,lineHeight:1.1,marginBottom:9},subtitle:{fontSize:11,color:'#527471',marginBottom:16},
 section:{fontFamily:'PlumeSerif',fontSize:19,marginBottom:10,marginTop:18},finding:{padding:10,marginBottom:7,backgroundColor:'#eaf1e9',borderRadius:8},label:{fontSize:8,letterSpacing:1,color:'#176b73',fontWeight:600,marginBottom:5},
 row:{flexDirection:'row',gap:12},figure:{flex:1,padding:10,backgroundColor:'#e2eade',borderRadius:8},image:{height:125,objectFit:'contain',marginBottom:8},caption:{fontSize:8,color:'#466766'},body:{marginBottom:10},small:{fontSize:8,color:'#517774'},
 tableRow:{flexDirection:'row',borderBottom:1,borderColor:'#d4e1d9',paddingVertical:9},cell:{flex:1,fontSize:9,paddingRight:7},strong:{fontWeight:600},warning:{padding:13,backgroundColor:'#eee9ef',borderRadius:8,marginVertical:12},
 footer:{position:'absolute',bottom:28,left:42,right:42,height:12,fontSize:7,color:'#5b7973',flexDirection:'row',justifyContent:'space-between'},record:{fontSize:8,marginBottom:10},link:{color:'#176b73',textDecoration:'underline'},
 note:{fontSize:10,marginBottom:12},divider:{borderBottom:1,borderColor:'#d4e1d9',marginVertical:14},bar:{height:6,flex:1},legend:{flexDirection:'row',marginVertical:5},
});
function toDataUrl(bytes:Uint8Array){let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return 'data:image/png;base64,'+btoa(text);}
function csvCell(value:unknown){const s=value==null?'':String(value);const safe=typeof value==='string'&&/^[=+@\-\t\r]/.test(s)?"'"+s:s;return '"'+safe.replaceAll('"','""')+'"';}
const Footer=()=> <Text fixed style={{position:'absolute',bottom:25,left:42,right:42,fontFamily:'PlumeSans',fontSize:8,lineHeight:1,color:'#5b7973'}} render={({pageNumber,totalPages})=>`Source: Carbon Mapper · Noncommercial data terms apply                                      ${pageNumber} / ${totalPages}`}/>;

self.onmessage=async(event:MessageEvent<{snapshot:Snapshot;input:EvidenceInput;kind:'pdf'|'zip';origin:string}>)=>{
 try{
  const {snapshot,input,kind,origin}=event.data;
  validateSnapshot(snapshot);
  if(snapshot.id!==input.snapshotId||snapshot.rulesVersion!==input.rulesVersion)throw new Error('The report input does not match the loaded snapshot.');
  const c=snapshot.cases.find(c=>c.id===input.caseId);if(!c)throw new Error('The investigation is not in this snapshot.');
  const observations=selectObservations(snapshot,c.id,input.selectedIds);if(!observations.length)throw new Error('Select at least one observation for the brief.');
  if(observations.length!==input.selectedIds.length)throw new Error('The selection contains an unknown or duplicate observation.');
  const claims=findings(c,observations),assessment=assess(c,observations),counts=dateCounts(observations);
  const fingerprint=await sha256(canonicalize({snapshotId:snapshot.id,rulesVersion:input.rulesVersion,schemaVersion:input.schemaVersion,caseId:c.id,selectedIds:[...input.selectedIds].sort(),observations,caseContext:c,relationships:snapshot.relationships.filter(r=>input.selectedIds.includes(r.observationId)),claims}));
  const notesHash=input.includeNotes?await sha256(input.notes):null;
  Font.register({family:'PlumeSans',fonts:[{src:new URL('/fonts/sans.woff',origin).href},{src:new URL('/fonts/sans-bold.woff',origin).href,fontWeight:600}]});Font.register({family:'PlumeSerif',src:new URL('/fonts/serif.woff',origin).href});
  const assetBytes=await Promise.all(observations.map(async o=>{if(!o.asset.url.startsWith('/data/'+snapshot.id+'/'))throw new Error('An evidence asset is outside the approved snapshot.');const response=await fetch(new URL(o.asset.url,origin));if(!response.ok)throw new Error('An evidence image is unavailable. Retry when the snapshot is loaded.');const bytes=new Uint8Array(await response.arrayBuffer());const recorded=snapshot.files.find(f=>f.path===o.asset.url.split('/').at(-1));if(!recorded||await sha256(bytes)!==recorded.sha256)throw new Error('An evidence image failed its integrity check.');return bytes;}));
  const legendResponse=await fetch(new URL('/data/'+snapshot.id+'/cividis.png',origin));if(!legendResponse.ok)throw new Error('The scientific color legend is unavailable.');const legendBytes=new Uint8Array(await legendResponse.arrayBuffer());if(await sha256(legendBytes)!==snapshot.files.find(f=>f.path==='cividis.png')?.sha256)throw new Error('The color legend failed its integrity check.');const legend=toDataUrl(legendBytes);
  const images=assetBytes.map(toDataUrl);const generatedAt=new Date().toISOString();
  const document=<Document title={`Plume investigation — ${c.place}`} author="Plume" subject="Selected published methane evidence" creator="Plume evidence engine 1.0">
   <Page size="A4" style={styles.page}>
    <View style={styles.top}><Text style={styles.logo}>Plume</Text><Text style={styles.small}>INVESTIGATION BRIEF{`\n`}Snapshot {snapshot.retrievedAt}</Text></View>
    <Text style={styles.eyebrow}>PUBLISHED OBSERVATIONS, IN CONTEXT</Text><Text style={styles.title}>{c.place}</Text><Text style={styles.subtitle}>{counts.days} detection dates · {observations.length} selected observations{`\n`}{dateLabel(observations[0].date,true)} — {dateLabel(observations.at(-1)!.date,true)}</Text>
    {claims.map(cl=><View key={cl.id} style={styles.finding} wrap={false}><Text style={styles.label}>{cl.kind==='next'?'NEXT EVIDENCE STEP':cl.kind.toUpperCase()}</Text><Text>{cl.text}</Text></View>)}
    <Text style={styles.section}>The dated observations</Text><View style={styles.row}>{observations.slice(0,2).map((o,i)=><View key={o.id} style={styles.figure} wrap={false}><Image style={styles.image} src={images[i]}/><Text style={styles.strong}>{dateLabel(o.date,true)}</Text><Text style={styles.caption}>{o.instrument} · {o.asset.quantity}</Text><Image src={legend} style={{height:6,marginVertical:5}}/><Text style={styles.caption}>0 — {o.asset.scale[1].toLocaleString()} ppm·m</Text><Text style={styles.caption}>Each image retains its own geographic extent. Blank pixels are not measured zeros.</Text></View>)}</View>
    <Text style={[styles.small,{marginTop:12}]}>{c.scope}. Representative area: {c.location[1].toFixed(4)}° latitude, {c.location[0].toFixed(4)}° longitude. The full selected observation register follows.</Text><Footer/>
   </Page>
   <Page size="A4" style={styles.page} wrap><Text style={styles.eyebrow}>OBSERVATION REGISTER</Text><Text style={styles.title}>What each record measures</Text><Text style={styles.body}>These estimates describe separate moments. A difference between them does not establish a change in ongoing emissions. Plume rates and the image’s column enhancement are different quantities.</Text>
    <View style={styles.tableRow}><Text style={[styles.cell,styles.strong]}>Acquisition (UTC)</Text><Text style={[styles.cell,styles.strong]}>Plume rate, kg/h</Text><Text style={[styles.cell,styles.strong]}>Provider uncertainty</Text><Text style={[styles.cell,styles.strong]}>Processing</Text></View>
    {observations.map(o=><View key={o.id} style={styles.tableRow} wrap={false}><Text style={styles.cell}>{dateLabel(o.date,true)}{`\n`}{o.date.slice(11,19)}</Text><Text style={styles.cell}>{o.rate===null?o.rateStatus:Math.round(o.rate).toLocaleString()}</Text><Text style={styles.cell}>{o.uncertainty===null?'Not provided':`± ${Math.round(o.uncertainty).toLocaleString()} kg/h`}</Text><Text style={styles.cell}>{o.processing}</Text></View>)}
    <Text style={[styles.small,{marginTop:10}]}>Uncertainty is reproduced as supplied by the provider. Its interval definition is not established in this snapshot; it must not be read as a 95% confidence interval. Missing or suppressed values are never zero.</Text>
    <Text style={styles.section}>Can these figures be compared?</Text>
    {c.inventory?<Text style={styles.body}>Reported context: {c.inventory.facility}, {c.inventory.year}: {c.inventory.value.toLocaleString()} {c.inventory.unit.replace('₄','4')}. {c.inventory.boundary}. {c.inventory.method}.</Text>:<Text style={styles.body}>No relevant annual reporting record is included for this case. The available observations cannot supply annual methane mass.</Text>}
    <View style={styles.warning}><Text style={styles.strong}>Numerical comparison withheld</Text><Text>Individual acquisitions do not establish an entire year of emissions. Facility identity, boundaries, and uncertainty also require review.</Text></View>
    {c.attributionContext&&<View style={styles.warning} wrap={false}><Text style={styles.strong}>Source-process attribution remains unresolved</Text><Text style={styles.small}>{c.attributionContext}</Text><Link src={c.contextSource} style={styles.link}>Official permitted source list</Link></View>}<Footer/></Page><Page size="A4" style={styles.page}><Text style={styles.eyebrow}>COMPARABILITY ASSESSMENT</Text><Text style={styles.title}>Why the comparison stops here</Text><Text style={styles.body}>Each condition has its own status. Unknown conditions are not treated as passed. This assessment does not estimate an annual discrepancy.</Text>{assessment.map(a=><View key={a.id} style={{marginBottom:9}} wrap={false}><Text style={styles.strong}>{a.label} · {a.status.replace('_',' ')}</Text><Text style={styles.small}>{a.reason.replace('₄','4')}</Text></View>)}<Footer/>
   </Page>
   <Page size="A4" style={styles.page} wrap><Text style={styles.eyebrow}>PROVENANCE & REUSE</Text><Text style={styles.title}>Follow the record trail</Text>
    <Text style={styles.body}>Publications, acquisitions, and plumes are separate entities. Multiple product or processing-version records of one observation do not add detection days. No verified cross-provider acquisition join is claimed by this snapshot.</Text>
    {observations.map(o=><View key={o.id} style={styles.record} wrap={false}><Text style={styles.strong}>{o.id}</Text><Text>{dateLabel(o.date,true)} · {o.provider} / {o.instrument} · {o.locationRole}</Text><Link src={o.sourceUrl} style={styles.link}>Original provider record</Link><Text>Native CRS {o.asset.nativeCrs}; display {o.asset.crs}, nearest-neighbor resampling. Bounds (W,S,E,N): {o.asset.bounds.map(x=>x.toFixed(5)).join(', ')}.</Text></View>)}
    {snapshot.relationships.filter(r=>input.selectedIds.includes(r.observationId)).map(r=><View key={r.id} style={{marginBottom:5}} wrap={false}><Text style={styles.small}>{r.collection} · {r.role}</Text><Link style={[styles.link,styles.small]} src={r.sourceUrl}>{r.observationId}</Link></View>)}
    {observations.slice(2).map((o,i)=><View key={o.id} style={{marginTop:15}} wrap={false}><Text style={styles.strong}>Additional selected image · {dateLabel(o.date,true)}</Text><Image src={images[i+2]} style={{height:150,objectFit:'contain'}}/><Text style={styles.small}>Column enhancement, 0–{o.asset.scale[1]} ppm·m. Source: Carbon Mapper.</Text></View>)}
    {input.includeNotes&&input.notes&&<><Text style={styles.section}>User notes — not verified findings</Text><Text style={styles.note}>{input.notes}</Text></>}
    <Text style={styles.section}>Data terms and limitations</Text><Text style={styles.body}>Source: Carbon Mapper. Data and derived imagery retain Carbon Mapper’s noncommercial, attribution, and downstream terms. The application’s software license does not relicense this data. This independent project is not endorsed by the data provider.</Text><Link src={snapshot.termsUrl} style={styles.link}>Carbon Mapper Terms of Use</Link>
    {c.inventory&&<Link src={c.inventory.sourceUrl} style={styles.link}>EPA reporting data source</Link>}
    <Text style={[styles.small,{marginTop:12}]}>Frozen snapshot: {snapshot.id}. Rules {snapshot.rulesVersion}; schema {snapshot.schemaVersion}. Generated {generatedAt}. Evidence fingerprint: {fingerprint}. The fingerprint proves reproducible content, not scientific truth.</Text><Footer/>
   </Page>
  </Document>;
  const blob=await pdf(document).toBlob();const pdfBytes=new Uint8Array(await blob.arrayBuffer());
  if(kind==='pdf'){self.postMessage({bytes:pdfBytes,fingerprint,input,generatedAt},[pdfBytes.buffer]);return;}
  const files:Record<string,Uint8Array>={'brief.pdf':pdfBytes,'assets/cividis.png':legendBytes};
  const add=(name:string,value:unknown)=>{files[name]=strToU8(JSON.stringify(value,null,2)+'\n');};
  add('case.json',{...c,selectedIds:input.selectedIds,scope:'Selected evidence',notes:input.includeNotes?input.notes:undefined});add('claims.json',claims);add('comparison.json',assessment);
  add('relationships.json',snapshot.relationships.filter(r=>input.selectedIds.includes(r.observationId)));
  add('sources.json',observations.map(o=>({id:o.id,acquisitionId:o.acquisitionId,sourceUrl:o.sourceUrl,provider:o.provider,instrument:o.instrument,processing:o.processing,quantity:{kind:o.rateKind,value:o.rate,unit:o.rateUnit,uncertainty:o.uncertainty,definition:o.uncertaintyDefinition,displayStatus:o.rateStatus},asset:o.asset})));
  add('geometries.geojson',{type:'FeatureCollection',features:observations.flatMap(o=>[{type:'Feature',id:o.id+'-origin',properties:{observationId:o.id,role:o.locationRole},geometry:{type:'Point',coordinates:o.location}},...o.outline.features.map((f,i)=>({...f,id:o.id+'-outline-'+i,properties:{...f.properties,observationId:o.id,role:'provider plume outline'}}))])});
  const columns=['observation_id','acquisition_id','acquisition_utc','provider','instrument','quantity_kind','value','unit','display_status','uncertainty','uncertainty_definition','processing_version','source_url'];
  files['observations.csv']=strToU8([columns.map(csvCell).join(','),...observations.map(o=>[o.id,o.acquisitionId,o.date,o.provider,o.instrument,o.rateKind,o.rate,o.rateUnit,o.rateStatus,o.uncertainty,o.uncertaintyDefinition,o.processing,o.sourceUrl].map(csvCell).join(','))].join('\r\n')+'\r\n');
  observations.forEach((o,i)=>{files['assets/'+o.id+'.png']=assetBytes[i];});
  files['ATTRIBUTION.txt']=strToU8('Source: Carbon Mapper\nData and derived images: noncommercial use, attribution, and same downstream terms apply. These assets are not MIT licensed.\nhttps://carbonmapper.org/terms\nOriginal application code: MIT. Independent project; no provider endorsement.\n');
  files['licenses/DATA-TERMS.txt']=files['ATTRIBUTION.txt'];
  if(c.inventory){add('inventory.json',c.inventory);files['licenses/EPA.txt']=strToU8('Source: US Environmental Protection Agency, Greenhouse Gas Reporting Program. Original public federal reporting data; Plume is not endorsed by EPA.\n'+c.inventory.sourceUrl+'\n');}
  add('infrastructure.json',{facilities:c.facilities||[],context:c.attributionContext||null,sourceUrl:c.contextSource||null});
  const checksums=await Promise.all(Object.entries(files).map(async([path,bytes])=>({path,bytes:bytes.byteLength,sha256:await sha256(bytes)})));
  add('manifest.json',{snapshotId:snapshot.id,schemaVersion:input.schemaVersion,rulesVersion:input.rulesVersion,softwareVersion:'1.0.0',generatedAt,selectedIds:input.selectedIds,evidenceFingerprint:fingerprint,notesHash,canonicalInput:input,files:checksums,sourceTerms:snapshot.termsUrl});
  files['manifest.sha256']=strToU8(await sha256(files['manifest.json'])+'  manifest.json\n');
  const bytes=zipSync(files,{level:6});self.postMessage({bytes,fingerprint,input,generatedAt},[bytes.buffer]);
 }catch(error){self.postMessage({error:error instanceof Error?error.message:'Unable to generate the selected evidence. Your work is preserved.'});}
};
