/** Keep the illustrated landing visible until the destination workspace is mounted. */
export function enterMap(href:string,push:(href:string)=>void,search?:HTMLElement|null){
 if(location.pathname!=='/'||!document.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches){push(href);return;}
 if(document.documentElement.dataset.mapTransition)return;
 document.documentElement.dataset.mapTransition='opening';
 if(search)search.style.viewTransitionName='plume-search';
 const transition=document.startViewTransition(()=>new Promise<void>((resolve,reject)=>{
  let timer:ReturnType<typeof setTimeout>;
  const finish=()=>{observer.disconnect();clearTimeout(timer);resolve();};
  const observer=new MutationObserver(()=>{
   if(document.querySelector('.application canvas')||document.querySelector('.error-page h1'))finish();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  timer=setTimeout(finish,1800);
  try{push(href);}catch(error){observer.disconnect();clearTimeout(timer);reject(error);}
 }));
 void transition.finished.catch(()=>{}).finally(()=>{
  delete document.documentElement.dataset.mapTransition;
  if(search)search.style.viewTransitionName='';
 });
}
