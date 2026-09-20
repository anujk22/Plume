import {test,expect} from '@playwright/test';

test('homepage ZIP selection opens its own map and survives reload',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('.home-search').click();
 const input=page.locator('.home-hero-search').getByRole('combobox');
 await input.fill('08831');await expect(page.getByRole('option',{name:/Monroe Township.*08831/})).toBeVisible();await input.press('Enter');
 await expect(page).toHaveURL(/\/places\/us-24058$/);await expect(page.getByRole('heading',{name:'Monroe Township 08831',exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'Search map centered on Monroe Township'})).toBeVisible();await expect(page.getByRole('heading',{name:'No included observations nearby'})).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByLabel('Search radius').selectOption('50');await expect(page).toHaveURL(/radius=50/);await page.reload();await expect(page.getByLabel('Search radius')).toHaveValue('50');await expect(page.getByText('The circle is a search area, not a plume boundary or an exposure estimate.')).toBeVisible();
 for(const width of [1672,1024,768,390]){await page.setViewportSize({width,height:941});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect(errors).toEqual([]);
});

test('nearby evidence opens the real investigation and empty date filters can reset',async({page})=>{
 await page.goto('/');await page.locator('.home-search').click();await page.locator('.home-hero-search').getByRole('combobox').fill('95035');await page.getByRole('option',{name:/Milpitas.*95035/}).click();
 await expect(page).toHaveURL(/\/places\//);await expect(page.locator('.place-result-card')).toContainText('3 observations');
 await page.getByLabel('From',{exact:true}).fill('2025-01-01');await expect(page.getByText('The selected date range excludes the nearby observations.')).toBeVisible();await page.getByRole('button',{name:'Reset date range',exact:true}).click();
 await page.locator('.place-result-card').click();await expect(page).toHaveURL(/\/investigations\/newby-island\?observation=/);await expect(page.locator('.selection-scope')).toContainText('3 selected observations');
});

test('Santiago shows sourced regional detections and selected footprints',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/places/3871336');
 await expect(page.locator('.place-results-title')).toContainText('30 observations');
 await expect(page.locator('.catalog-selection')).toContainText('Tanager-1');
 const link=page.getByRole('link',{name:'View original record'});
 const initial=await link.getAttribute('href');
 await page.locator('.catalog-records button').nth(1).click();
 await expect(link).not.toHaveAttribute('href',initial!);
 await expect(link).toHaveAttribute('href',/^https:\/\/api.carbonmapper.org\/api\/v1\/stac\/collections\/l3a-vis-ch4-/);
 await expect(page.getByRole('button',{name:'Selected plume',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Inspect sensor pixels'}).click();
 await expect(page.getByRole('button',{name:'Show contour bands'})).toBeVisible();
 await page.getByRole('button',{name:'Show contour bands'}).click();
 await page.getByRole('button',{name:'Area overview',exact:true}).click();
 await page.getByRole('button',{name:'Zoom to detection'}).click();
 await page.locator('.catalog-records button').nth(3).click();
 await expect(page.locator('.catalog-plume-preview')).toHaveCount(0);
 await expect(page.getByText('Concentration imagery is not prepared for this date.',{exact:false})).toBeVisible();
 await page.getByLabel('Search radius').selectOption('100');
 await expect(page.locator('.place-results-title')).toContainText('101 observations');
 await page.getByLabel('From',{exact:true}).fill('2027-01-01');
 await expect(page.getByText('The selected date range excludes the nearby observations.')).toBeVisible();
 await page.getByRole('button',{name:'Reset date range',exact:true}).click();
 await expect(page.locator('.catalog-selection')).toBeVisible();
 for(const width of [1672,1024,768,390]){await page.setViewportSize({width,height:941});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect(errors).toEqual([]);
});
