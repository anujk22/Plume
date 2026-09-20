import {test,expect} from '@playwright/test';

test('worldwide detections remain separate from selected case evidence',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/investigations/newby-island');
 const catalog=page.getByRole('complementary',{name:'Worldwide methane catalog'});
 await expect(catalog).toContainText('1,686 in catalog');
 await expect(page.locator('.selection-scope')).toContainText('3 selected observations');
 await page.getByRole('button',{name:'World view',exact:true}).click();
 await expect(catalog).toContainText('1,686 in view');
 await page.getByRole('checkbox',{name:'Published hotspots worldwide'}).uncheck();
 await expect(catalog).toContainText('0 in view');
 await page.getByRole('checkbox',{name:'Published hotspots worldwide'}).check();
 await expect(catalog).toContainText('1,686 in view');
 await expect(page.locator('.selection-scope')).toContainText('3 selected observations');
 await catalog.locator('.global-record-list summary').click();
 await catalog.locator('.global-record-list button').first().click();
 await expect(catalog.locator('.global-record')).toContainText('Peak column enhancement');
 await expect(catalog.getByRole('link',{name:'NASA source data'})).toHaveAttribute('href',/^https:\/\/data.lpdaac.earthdatacloud.nasa.gov\//);
 expect(errors).toEqual([]);
});

test('catalog source failure is explicit and preserves reviewed evidence',async({page})=>{
 await page.route('**/global-methane/points.geojson',route=>route.abort());
 await page.goto('/explore');
 await expect(page.getByText('NASA catalog unavailable.',{exact:true})).toBeVisible();
 await expect(page.locator('.selection-scope')).toContainText('2 selected observations');
 await expect(page.getByRole('button',{name:'Create investigation brief'})).toBeVisible();
});
