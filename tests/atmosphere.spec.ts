import {test,expect} from '@playwright/test';

test('regional methane has its own dated scale and preserves case evidence',async({page,request})=>{
 const tile=await request.get('/api/atmosphere/202608/2/0/2');expect(tile.status()).toBe(200);expect(tile.headers()['content-type']).toBe('image/png');expect(Array.from((await tile.body()).subarray(0,8))).toEqual([137,80,78,71,13,10,26,10]);
 const empty=await request.get('/api/atmosphere/202608/2/1/0');expect(empty.status()).toBe(200);expect(empty.headers()['x-plume-no-data']).toBe('true');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/investigations/newby-island');
 const transparent=await page.evaluate(async()=>{
  const response=await fetch('/api/atmosphere/202608/2/1/0');
  const bitmap=await createImageBitmap(await response.blob());
  const canvas=new OffscreenCanvas(1,1),ctx=canvas.getContext('2d')!;
  ctx.drawImage(bitmap,0,0);bitmap.close();
  return Array.from(ctx.getImageData(0,0,1,1).data);
 });
 expect(transparent).toEqual([0,0,0,0]);
 const atmosphere=page.getByRole('region',{name:'Regional atmospheric methane'});
 await expect(atmosphere).toContainText('ppbv · monthly mean');
 await expect(atmosphere).toContainText('Zoom out for regional methane');
 await atmosphere.getByRole('button',{name:'Regional view'}).click();
 await expect(atmosphere).toContainText('Gaps have no valid measurement.',{timeout:30000});
 await page.getByLabel('Atmospheric measurement month').selectOption('202408');
 await expect(atmosphere.getByRole('link')).toHaveAttribute('href',/cd261113/);
 await expect(atmosphere).toContainText('Gaps have no valid measurement.',{timeout:30000});
 await expect(page.locator('.selection-scope')).toContainText('3 selected observations');
 await expect(atmosphere).toContainText('Historical monthly average, not live');
 const themedLegend=await atmosphere.locator('.atmospheric-scale').getAttribute('style');
 await atmosphere.getByRole('checkbox',{name:'Provider colors',exact:true}).check();
 await expect(atmosphere.locator('.atmospheric-scale')).not.toHaveAttribute('style',themedLegend!);
 await expect(atmosphere).toContainText('Gaps have no valid measurement.',{timeout:30000});
 await page.getByRole('checkbox',{name:'Atmospheric methane',exact:true}).uncheck();
 await expect(page.getByLabel('Atmospheric measurement month')).toHaveCount(0);
 await expect(page.locator('.selection-scope')).toContainText('3 selected observations');
 expect(errors).toEqual([]);
});

test('atmospheric failures are visible and tile proxy is bounded',async({page,request})=>{
 for(const path of ['nope/2/0/2','202608/6/0/0','202608/2/4/0','202608/2/0/4'])expect((await request.get('/api/atmosphere/'+path)).status()).toBe(404);
 await page.route('**/api/atmosphere/**',route=>route.fulfill({status:502,body:'Unavailable'}));
 await page.goto('/places/us-24058');
 await expect(page.getByRole('region',{name:'Regional atmospheric methane'})).toContainText('Atmospheric tiles unavailable',{timeout:30000});
 await expect(page.locator('.place-map-canvas canvas')).toBeVisible();
 await expect(page.getByRole('link',{name:'Marib region, Yemen',exact:true})).toBeVisible();
});
