'use client';
import {useEffect,useState} from 'react';
import {validateSnapshot} from '@/lib/plume/validate';
import type {Snapshot} from '@/lib/plume/types';
let cached:Snapshot|undefined;
export function useSnapshot(){const [snapshot,setSnapshot]=useState<Snapshot|undefined>(cached);const [error,setError]=useState('');useEffect(()=>{if(cached)return;const controller=new AbortController();fetch('/data/plume-2026-09-19/snapshot.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('The evidence snapshot could not be loaded. Reload to try again.');return r.json() as Promise<Snapshot>;}).then(s=>{const valid=validateSnapshot(s);cached=valid;setSnapshot(valid);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>controller.abort();},[]);return {snapshot,error};}
