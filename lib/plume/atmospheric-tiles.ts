import {addProtocol} from 'maplibre-gl';
import {tintAtmosphericPixels} from './atmospheric-palette';

let installed=false;
export function registerAtmosphericTiles(){
 if(installed)return;
 installed=true;
 addProtocol('plume-atmosphere',async(params,controller)=>{
  const path=params.url.slice('plume-atmosphere://'.length);
  if(!/^\d{6}\/\d+\/\d+\/\d+$/.test(path))throw new Error('Invalid atmospheric tile');
  const response=await fetch(`/api/atmosphere/${path}`,{signal:controller.signal});
  if(!response.ok)throw new Error(`Atmospheric tile unavailable (${response.status})`);
  const bitmap=await createImageBitmap(await response.blob());
  try{
   const canvas=new OffscreenCanvas(bitmap.width,bitmap.height),ctx=canvas.getContext('2d');
   if(!ctx)throw new Error('Atmospheric display unavailable');
   ctx.drawImage(bitmap,0,0);
   const pixels=ctx.getImageData(0,0,bitmap.width,bitmap.height);
   tintAtmosphericPixels(pixels.data);ctx.putImageData(pixels,0,0);
   return {data:await (await canvas.convertToBlob({type:'image/png'})).arrayBuffer()};
  }finally{bitmap.close();}
 });
}
