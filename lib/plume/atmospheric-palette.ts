// An affine RGB display tint, not an inversion of the provider's precolored tiles.
// Linearity preserves the provider's blended colors without inventing scalar values.
export function tintAtmosphericColor(r:number,g:number,b:number):[number,number,number]{
 return [Math.round(20+184*r/255-82*g/255+82*b/255),Math.round(63+113*r/255-4*g/255+91*b/255),Math.round(70+55*r/255+28*g/255+49*b/255)];
}
export function tintAtmosphericPixels(pixels:Uint8ClampedArray){
 for(let i=0;i<pixels.length;i+=4){
  if(pixels[i+3]===0)continue;
  const [r,g,b]=tintAtmosphericColor(pixels[i],pixels[i+1],pixels[i+2]);
  pixels[i]=r;pixels[i+1]=g;pixels[i+2]=b;
 }
}
