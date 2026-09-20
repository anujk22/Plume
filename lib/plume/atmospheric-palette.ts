// An affine RGB display tint, not an inversion of the provider's precolored tiles.
// Linearity preserves the provider's blended colors without inventing scalar values.
export function tintAtmosphericColor(r:number,g:number,b:number):[number,number,number]{
 return [Math.round(10+208*r/255-6*g/255+18*b/255),Math.round(65+48*r/255+65*g/255+41*b/255),Math.round(78-16*r/255+29*g/255+34*b/255)];
}
export function tintAtmosphericPixels(pixels:Uint8ClampedArray){
 for(let i=0;i<pixels.length;i+=4){
  if(pixels[i+3]===0)continue;
  const [r,g,b]=tintAtmosphericColor(pixels[i],pixels[i+1],pixels[i+2]);
  pixels[i]=r;pixels[i+1]=g;pixels[i+2]=b;
 }
}
