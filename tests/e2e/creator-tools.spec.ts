import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('strategicSlothPrivacyV1',JSON.stringify({analytics:false,marketing:false,updated:Date.now()})));await page.goto('/tools/');});
test('idea builder generates a free draft and points to a real book sample',async({page})=>{
 await page.locator('#topic-input').fill('freelance photography');await page.locator('#generate-btn').click();await expect(page.locator('#result-card')).toBeVisible();await expect(page.locator('#result-title')).not.toBeEmpty();await expect(page.locator('#build-narriaflow-btn')).toHaveAttribute('href','/samples/dont-do-anything/');
 expect(await page.locator('[id]').evaluateAll(els=>{const ids=els.map(el=>el.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);})).toEqual([]);
});
for(const [tool,field,book] of [['angle','angle-topic','offer-sells-itself'],['outline','outline-topic','idea-to-pdf'],['cover','cover-topic','idea-to-pdf'],['offer','offer-product-name','offer-sells-itself'],['sales','sales-product-name','landing-pages']]){
 test(`${tool} tool generates results and offers the matching book`,async({page})=>{
  await page.locator(`.tool-trigger[data-tool="${tool}"]`).click();await page.locator(`#${field}`).fill('Freelance photography starter kit');
  if(tool==='sales')await page.locator('#sales-desired-result').fill('Plan a first photo session');
  await page.locator(`#${tool}-generate-btn`).click();await expect(page.locator(`#${tool}-result`)).toBeVisible();
  const offer=page.locator(`#${tool}-result .tool-book-offer`);await expect(offer).toBeVisible();await expect(offer.locator('[data-track="checkout_click"]')).toHaveAttribute('data-track-product',book);
  await page.locator(`#${tool}-modal-close`).click();await expect(page.locator(`#${tool}-modal-overlay`)).toHaveClass(/pointer-events-none/);
 });
}
