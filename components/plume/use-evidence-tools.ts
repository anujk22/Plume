'use client';
import {useEffect,useRef} from 'react';
import type {Case,Claim,Observation,Snapshot} from '@/lib/plume/types';
type Tool={name:string;title:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown|Promise<unknown>};
type Context={registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>};
export function useEvidenceTools(state:{snapshot:Snapshot;caseData:Case;observations:Observation[];selected:string[];claims:Claim[];select:(ids:string[])=>void;openBrief:()=>void}){
 const current=useRef(state);current.current=state;
 useEffect(()=>{
  const context=(document as Document&{modelContext?:Context}).modelContext;if(!context)return;
  const life=new AbortController();const noArgs={type:'object',properties:{},additionalProperties:false};
  const view=()=>{const s=current.current;return {snapshotId:s.snapshot.id,caseId:s.caseData.id,place:s.caseData.place,observations:s.observations.map(o=>({id:o.id,date:o.date,provider:o.provider,sourceUrl:o.sourceUrl})),selectedIds:s.selected,claims:s.claims};};
  const settled=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
  const tools:Tool[]=[
   {name:'read_investigation_evidence',title:'Read selected evidence',description:'Read the current investigation, included observations, selected evidence, and derived findings. Private notes are never returned.',inputSchema:noArgs,annotations:{readOnlyHint:true,untrustedContentHint:false},execute:view},
   {name:'select_investigation_evidence',title:'Select evidence for a brief',description:'Replace the selected observations in this investigation and recompute its visible findings. Selection is saved on this browser. This does not generate or download a report.',inputSchema:{type:'object',properties:{observationIds:{type:'array',items:{type:'string'},uniqueItems:true}},required:['observationIds'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async input=>{const v=input as {observationIds?:unknown};if(!v||Object.keys(v).some(k=>k!=='observationIds')||!Array.isArray(v.observationIds)||v.observationIds.some(id=>typeof id!=='string'||!current.current.observations.some(o=>o.id===id))||new Set(v.observationIds).size!==v.observationIds.length)throw new Error('Provide unique observation IDs from the current investigation.');current.current.select(v.observationIds);await settled();return view();}},
   {name:'open_investigation_brief',title:'Open the report builder',description:'Open the visible PDF and evidence ZIP builder for the current selection. This stages the report; the user can generate, preview, and download it using the visible controls. No private notes are read or included.',inputSchema:noArgs,annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async()=>{if(!current.current.selected.length)throw new Error('Select at least one observation first.');current.current.openBrief();await settled();return {status:'report_builder_open',selectedIds:current.current.selected};}}
  ];
  for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:life.signal})).catch(()=>{});}catch{/* Unsupported browser integrations do not affect the visible application. */}}
  return()=>life.abort();
 },[]);
}
