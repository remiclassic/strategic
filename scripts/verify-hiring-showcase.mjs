import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 const failures=[];
 page.on('response',response=>{if(response.status()>=400&&response.url().startsWith('http://127.0.0.1:4321'))failures.push(response.url());});
 fs.mkdirSync('design/hiring-showcase',{recursive:true});
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  for(const route of ['', 'work/real-estate/', 'work/narriaflow/', 'work/world-editor/', 'contact/?engagement=prototype#enquiry']) {
   await page.goto(`http://127.0.0.1:4321/${route}`);
   await page.locator('main img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
   await page.waitForFunction(()=>[...document.querySelectorAll('main img')].every(img=>img.complete));
   if(await page.locator('main img').evaluateAll(images=>images.some(img=>!img.naturalWidth)))throw new Error(`Broken image on ${route}`);
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`Overflow at ${width} on ${route}`);
   if(route==='') {
    if(await page.locator('.engagement-grid article').count()!==3)throw new Error('Missing engagement offers');
    const reel=page.locator('#studio-reel video');
    const metadata=await reel.evaluate(video=>new Promise((resolve,reject)=>{video.onloadedmetadata=()=>resolve(video.duration);video.onerror=()=>reject(new Error('Reel cannot load'));video.load();}));
    if(Math.abs(metadata-45)>.2)throw new Error(`Reel duration ${metadata}`);
    await reel.evaluate(video=>{video.muted=true;return video.play();});
    await page.waitForFunction(()=>document.querySelector('#studio-reel video').currentTime>.2);
    await reel.evaluate(video=>video.pause());
   }
   if(route.startsWith('contact')) {
    await page.waitForFunction(()=>document.querySelector('[name=subject]').value==='Prototype sprint');
    if(!(await page.locator('[name=message]').inputValue()).includes('Journey to prototype:'))throw new Error('Brief template missing');
    await page.locator('[name=message]').fill('Preserve my custom project brief.');
    await page.locator('[data-engagement=review]').click();
    if(await page.locator('[name=message]').inputValue()!=='Preserve my custom project brief.')throw new Error('Custom draft overwritten');
    await page.evaluate(()=>localStorage.removeItem('strategicsloth.project-enquiry.v1'));
   }
   await page.addStyleTag({content:'astro-dev-toolbar { display:none !important; }'});
   const privacy=page.getByRole('button',{name:'Essential only',exact:true});
   if(await privacy.isVisible())await privacy.click();
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:`design/hiring-showcase/${route.startsWith('work/')?route.split('/')[1]:route?'contact':'home'}-${width}.png`});
  }
 }
 if(failures.length)throw new Error(`Failed local requests: ${failures.join(', ')}`);
 console.log('Passed desktop/mobile: three case studies, real estate assets, reel duration and playback, engagement links, brief prefilling, and draft preservation.');
}finally{await browser.close();}
