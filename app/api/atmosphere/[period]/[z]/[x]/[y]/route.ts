import manifest from '@/public/data/atmosphere/manifest.json';

// The provider's public TMS tiles have no CORS headers. Proxy only these fixed datasets.
export async function GET(_request:Request,{params}:{params:Promise<{period:string;z:string;x:string;y:string}>}){
 const p=await params,period=manifest.periods.find(item=>item.id===p.period);
 if(!period||![p.z,p.x,p.y].every(v=>/^\d+$/.test(v)))return new Response('Unknown tile',{status:404});
 const z=Number(p.z),x=Number(p.x),y=Number(p.y);
 if(z>manifest.nativeTileZoom||x>=2**z||y>=2**z)return new Response('Unknown tile',{status:404});
 try{
  const response=await fetch(`https://s5p-pal-nl-l3-tms.obs.eu-nl.otc.t-systems.com/${period.path}/${z}/${x}/${y}.png`,{signal:AbortSignal.timeout(15000)});
  // S5P-PAL's sparse tile pyramid omits tiles with no qualified measurements.
  if(response.status===404){
   const empty=Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAarVyFEAAAAASUVORK5CYII='),c=>c.charCodeAt(0));
   return new Response(empty,{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400','X-Plume-No-Data':'true'}});
  }
  if(!response.ok)return new Response('Atmospheric tile unavailable',{status:502});
  return new Response(response.body,{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400, s-maxage=604800','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Atmospheric tile unavailable',{status:502});}
}
