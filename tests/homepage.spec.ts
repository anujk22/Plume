import {test,expect} from '@playwright/test';

test('illustrated homepage opens real investigations and preserves honest search coverage',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.getByText('Not measured methane data',{exact:true})).toBeVisible();await expect(page.locator('canvas')).toHaveCount(0);await expect(page.locator('.home-map-area')).not.toContainText('t/hr');
 await page.getByRole('navigation',{name:'Explore Plume'}).getByRole('link',{name:'Map',exact:true}).click();await expect(page).toHaveURL(/\/investigations\/newby-island/);await expect(page.locator('.selection-scope')).toContainText('3 selected observations');
 await page.goto('/');await page.getByRole('navigation',{name:'Explore Plume'}).getByRole('link',{name:'Compare',exact:true}).click();await expect(page).toHaveURL(/view=compare/);await expect(page.locator('.compare-stage .map-pane')).toHaveCount(2);
 await page.goto('/');await page.locator('.home-search').click();await page.locator('.home-hero-search').getByRole('combobox').fill('Denver');await page.getByRole('option',{name:/Denver.*United States/}).click();await expect(page).toHaveURL(/\/places\//);await expect(page.getByRole('heading',{name:'No case or regional records nearby'})).toBeVisible();await expect(page.locator('.place-map-canvas canvas')).toBeVisible();expect(errors).toEqual([]);
});

test('homepage fits desktop and mobile widths',async({page})=>{
 for(const width of [1672,1024,768,390]){await page.setViewportSize({width,height:941});await page.goto('/');await expect(page.getByRole('heading',{name:'Plume',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('homepage suggestions stay under either search bar and support keyboard dismissal and selection',async({page})=>{
 await page.goto('/');const hero=page.locator('.home-hero-search'),compact=page.locator('.home-compact-search');
 await hero.getByRole('combobox').click();await expect(hero.locator('.home-search-dropdown')).toBeVisible();await expect(page.locator('[data-slot="sheet-overlay"]')).toHaveCount(0);
 const bar=await hero.locator('form').boundingBox(),dropdown=await hero.locator('.home-search-dropdown').boundingBox();expect(dropdown!.y).toBeGreaterThanOrEqual(bar!.y+bar!.height);expect(Math.abs(dropdown!.x-bar!.x)).toBeLessThan(2);
 await hero.getByRole('combobox').press('Escape');await expect(hero.locator('.home-search-dropdown')).toHaveCount(0);
 await compact.getByRole('combobox').click();await expect(compact.locator('.home-search-dropdown')).toBeVisible();await expect(hero.locator('.home-search-dropdown')).toHaveCount(0);
 await page.getByRole('heading',{name:'Plume',exact:true}).click();await expect(compact.locator('.home-search-dropdown')).toHaveCount(0);
 await hero.getByRole('combobox').fill('08831');await expect(hero.getByRole('option',{name:/Monroe Township/})).toBeVisible();await hero.getByRole('combobox').press('ArrowDown');await expect(hero.getByRole('option').first()).toHaveAttribute('aria-selected','true');await hero.getByRole('combobox').press('Enter');await expect(page).toHaveURL(/\/places\/us-24058/);
});

test('search transitions into the map and respects reduced motion',async({page})=>{
 await page.addInitScript(()=>{
  const start=document.startViewTransition.bind(document);
  Object.assign(window,{mapTransitionState:'unused'});
  document.startViewTransition=(...args:Parameters<typeof start>)=>{
   Object.assign(window,{mapTransitionState:'started'});
   const transition=start(...args);
   void transition.ready.then(()=>Object.assign(window,{mapTransitionState:'ready'}),()=>Object.assign(window,{mapTransitionState:'failed'}));
   void transition.finished.then(()=>{if((window as unknown as {mapTransitionState:string}).mapTransitionState!=='failed')Object.assign(window,{mapTransitionState:'finished'});});
   return transition;
  };
 });
 await page.goto('/');
 const search=page.locator('.home-hero-search');
 await search.getByRole('combobox').fill('Santiago');
 await search.getByRole('option',{name:/^Santiago Santiago Metropolitan/}).click();
 await expect(page).toHaveURL(/\/places\/3871336/);
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {mapTransitionState:string}).mapTransitionState)).toBe('finished');
 await expect(page.locator('html')).not.toHaveAttribute('data-map-transition');
 await expect(page.locator('.place-map-canvas canvas')).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Explore the map'}).click();
 await expect(page).toHaveURL(/\/explore/);
 expect(await page.evaluate(()=>(window as unknown as {mapTransitionState:string}).mapTransitionState)).toBe('unused');
 await expect(page.locator('.application canvas')).toBeVisible();
});
