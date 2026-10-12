import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,channel:"msedge"});
const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('design/studio-refresh',{recursive:true});
for(const width of [1440,390]) {
 await page.setViewportSize({width,height:1000});
 for(const route of ['','services/','work/','contact/','products/','studio/','games/']){
  const response=await page.goto('http://127.0.0.1:4321/'+route,{waitUntil:'networkidle'});
  if(response.status()!==200)throw Error(route+' '+response.status());
  await page.evaluate(async()=>{await Promise.all([...document.images].filter(img=>img.getAttribute('src')).map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});
  const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&!i.naturalWidth).map(i=>i.src)}));
  console.log(width,route||'home',JSON.stringify(state));
  if(state.overflow||state.broken.length)throw Error('Layout/assets failed');
  if(!route)await page.screenshot({path:'design/studio-refresh/home-'+width+'.png',fullPage:true});
 }
}
await page.goto('http://127.0.0.1:4321/work/');
await page.getByRole('button',{name:'Concepts & prototypes'}).click();
if(await page.locator('#sliceforge').isVisible())throw Error('Filter failed');
if(!await page.locator('#training').isVisible())throw Error('Concept filter failed');
await page.getByRole('button',{name:'Professional credits'}).click();
if(!await page.locator('#professional-credits').isVisible()||await page.locator('#training').isVisible())throw Error('Credits filter failed');
await page.goto('http://127.0.0.1:4321/contact/?engagement=prototype');
await page.waitForLoadState('networkidle');
if(await page.locator('select[name=projectType]').inputValue()!=='Prototype sprint')throw Error('Brief prefill failed');
await page.locator('input[name=name]').fill('QA Person');await page.locator('input[name=email]').fill('qa@example.com');await page.locator('input[name=timeline]').fill('Next month');
await page.evaluate(()=>document.querySelector('[data-studio-enquiry]').dataset.endpoint='/qa-contact');
await page.route('**/qa-contact',r=>r.fulfill({status:500,body:'error'}));
await page.getByRole('button',{name:'Open email draft'}).click();await page.waitForTimeout(100);
if(!(await page.locator('[data-send-status]').textContent()).includes('could not be sent'))throw Error('Error state failed');
if(await page.locator('input[name=name]').inputValue()!=='QA Person')throw Error('Failed form lost details');
await page.unroute('**/qa-contact');await page.route('**/qa-contact',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
await page.getByRole('button',{name:'Open email draft'}).click();await page.waitForTimeout(100);
if(!(await page.locator('[data-send-status]').textContent()).includes('received'))throw Error('Success state failed');
console.log('Form success/failure and work filters passed. Browser errors:',JSON.stringify(errors));
if(errors.length)throw Error('Browser errors');
await browser.close();

