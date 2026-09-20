import {test,expect} from '@playwright/test';

test('illustrated homepage opens real investigations and preserves honest search coverage',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByText('Not measured methane data',{exact:true})).toBeVisible();await expect(page.locator('canvas')).toHaveCount(0);await expect(page.locator('.home-map-area')).not.toContainText('t/hr');
 await page.getByRole('navigation',{name:'Explore Plume'}).getByRole('link',{name:'Map',exact:true}).click();await expect(page).toHaveURL(/\/investigations\/newby-island/);await expect(page.locator('.selection-scope')).toContainText('3 selected observations');
 await page.goto('/');await page.getByRole('navigation',{name:'Explore Plume'}).getByRole('link',{name:'Compare',exact:true}).click();await expect(page).toHaveURL(/view=compare/);await expect(page.locator('.compare-stage .map-pane')).toHaveCount(2);
 await page.goto('/');await page.locator('.home-search').click();await page.getByRole('textbox',{name:'City, region, or US ZIP code'}).fill('Denver');await page.getByRole('button',{name:/Denver.*United States/}).click();await expect(page).toHaveURL(/\/places\//);await expect(page.getByRole('heading',{name:'No included observations nearby'})).toBeVisible();await expect(page.locator('.place-map-canvas canvas')).toBeVisible();expect(errors).toEqual([]);
});

test('homepage fits desktop and mobile widths',async({page})=>{
 for(const width of [1672,1024,768,390]){await page.setViewportSize({width,height:941});await page.goto('/');await expect(page.getByRole('heading',{name:'Plume',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
