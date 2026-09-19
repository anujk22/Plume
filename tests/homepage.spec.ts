import {test,expect} from '@playwright/test';

test('homepage controls select real dated evidence and preserve honest search coverage',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await expect(page.getByRole('button',{name:'Methane',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('.home-rate-card strong')).toHaveText('5.32 t/hr');
 await page.getByRole('button',{name:'Layers',exact:true}).click();
 await page.getByRole('button',{name:'3 August 2024 EMIT'}).click();
 await expect(page.locator('.home-rate-card strong')).toHaveText('1.63 t/hr');
 await expect(page.locator('.home-rate-card')).toHaveAttribute('href',/emi20240803t190415p13004-C/);
 await page.getByLabel('Show enhancement imagery').check();await expect(page.locator('.home-legend')).toContainText('Column enhancement');
 await page.getByRole('button',{name:'Close layers'}).click();await page.getByRole('button',{name:'Methane',exact:true}).click();await expect(page.getByRole('button',{name:'Methane',exact:true})).toHaveAttribute('aria-pressed','false');
 await expect(page.getByText('Methane layer hidden',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Preview 26 September 2024',exact:true}).click();await expect(page.locator('.home-rate-card strong')).toHaveText('2.13 t/hr');await expect(page.getByRole('button',{name:'Methane',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('.home-search').click();await page.getByRole('textbox',{name:'City, region, or US ZIP code'}).fill('Denver');await page.getByRole('button',{name:/Denver.*United States/}).click();await expect(page).toHaveURL(/\/places\//);await expect(page.getByRole('heading',{name:'No included observations nearby'})).toBeVisible();await expect(page.locator('.place-map-canvas canvas')).toBeVisible();expect(errors).toEqual([]);
});

test('homepage fits desktop and mobile widths',async({page})=>{
 for(const width of [1672,1024,768,390]){await page.setViewportSize({width,height:941});await page.goto('/');await expect(page.getByRole('heading',{name:'Plume',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
