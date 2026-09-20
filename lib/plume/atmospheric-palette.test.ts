import {describe,it,expect} from 'vitest';
import {tintAtmosphericColor,tintAtmosphericPixels} from './atmospheric-palette';

describe('atmospheric display tint',()=>{
 it('keeps data gaps and partial transparency unchanged',()=>{
  const pixels=new Uint8ClampedArray([255,255,0,255,0,255,255,100,55,66,77,0]);
  tintAtmosphericPixels(pixels);
  expect([...pixels]).toEqual([212,178,91,255,22,171,141,100,55,66,77,0]);
 });
 it('transforms blended provider colors consistently with the legend without decoding measurements',()=>{
  const a=[0,255,255],b=[255,255,0];
  const midpoint=tintAtmosphericColor(127.5,255,127.5);
  const low=tintAtmosphericColor(...a as [number,number,number]),high=tintAtmosphericColor(...b as [number,number,number]);
  midpoint.forEach((v,i)=>expect(Math.abs(v-(low[i]+high[i])/2)).toBeLessThanOrEqual(1));
  expect(tintAtmosphericColor(0,0,0)).toEqual([10,65,78]);
  expect(tintAtmosphericColor(255,0,0)).toEqual([218,113,62]);
 });
});
