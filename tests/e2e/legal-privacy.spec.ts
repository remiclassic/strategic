import { expect, test } from '@playwright/test';
const optional = /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr/;
test('optional tracking stays off before a choice and after rejection',async({page})=>{
 const requests:string[]=[];page.on('request',req=>{if(optional.test(req.url()))requests.push(req.url());});
 await page.goto('/books/');await expect(page.locator('#privacy-banner')).toBeVisible();
 expect(requests).toEqual([]);
 await Promise.all([page.waitForEvent('load'), page.locator('#privacy-banner').getByRole('button',{name:'Essential only',exact:true}).click()]);
 await expect(page.locator('#privacy-banner')).toBeHidden();
 await expect(page.locator('[data-track="checkout_click"]').first()).toHaveAttribute('href',/lemonsqueezy.com/);
 expect(requests).toEqual([]);
 expect(await page.evaluate(()=>localStorage.getItem('strategicSlothUtm'))).toBeNull();
});
test('analytics opt-in does not enable advertising; withdrawal removes tracking',async({page})=>{
 await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:'',contentType:'application/javascript'}));
 const requests:string[]=[];page.on('request',req=>{if(optional.test(req.url()))requests.push(req.url());});
 await page.goto('/books/');await page.locator('#privacy-banner').getByRole('button',{name:'Choose settings'}).click();
 await page.locator('#consent-analytics').check();await Promise.all([page.waitForEvent('load'), page.getByRole('button',{name:'Save choices',exact:true}).click()]);
 await expect.poll(()=>requests.some(url=>url.includes('googletagmanager'))).toBeTruthy();
 expect(requests.some(url=>url.includes('facebook'))).toBeFalsy();
 await page.getByRole('navigation',{name:'Legal',exact:true}).getByRole('button',{name:'Privacy choices',exact:true}).click();
 await Promise.all([page.waitForEvent('load'), page.locator('#privacy-settings').getByRole('button',{name:'Essential only'}).click()]);
 await expect(page.locator('#privacy-banner')).toBeHidden();
 const count=requests.length;await page.reload();expect(requests).toHaveLength(count);
});
test('GPC keeps advertising disabled even when optional services are accepted',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true}));
 await page.route('https://www.googletagmanager.com/**',route=>route.fulfill({body:'',contentType:'application/javascript'}));
 const meta:string[]=[];page.on('request',req=>{if(/facebook/.test(req.url()))meta.push(req.url());});
 await page.goto('/');await Promise.all([page.waitForEvent('load'), page.getByRole('button',{name:'Accept optional',exact:true}).click()]);
 await page.getByRole('navigation',{name:'Legal',exact:true}).getByRole('button',{name:'Privacy choices',exact:true}).click();
 await expect(page.locator('#consent-marketing')).toBeDisabled();await expect(page.locator('#consent-marketing')).not.toBeChecked();expect(meta).toEqual([]);
});
test('legal dialogs contain revised terms, close with Escape, and return focus',async({page})=>{
 await page.goto('/books/');await Promise.all([page.waitForEvent('load'), page.getByRole('button',{name:'Essential only',exact:true}).click()]);
 const terms=page.getByRole('navigation',{name:'Legal',exact:true}).getByRole('link',{name:'Terms & refunds',exact:true});
 await terms.click();const dialog=page.locator('#modal-terms');await expect(dialog).toBeVisible();
 await expect(dialog).toContainText('Commercial use of what you learn is allowed.');await expect(dialog).toContainText('30-day money-back guarantee');
 await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(terms).toBeFocused();
 await page.goto('/legal/privacy/');await expect(page.locator('h1')).toHaveText('Privacy policy');
 await expect(page.locator('.legal-page-body')).toContainText('Meta Pixel');
});
test('mobile legal panel scrolls within the viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/books/');await Promise.all([page.waitForEvent('load'), page.getByRole('button',{name:'Essential only',exact:true}).click()]);
 await page.getByRole('navigation',{name:'Legal',exact:true}).getByRole('link',{name:'Privacy',exact:true}).click();
 const dialog=page.locator('#modal-privacy');await expect(dialog).toBeVisible();
 const box=await dialog.boundingBox();expect(box!.width).toBeLessThanOrEqual(390);expect(box!.height).toBeLessThanOrEqual(844);
 expect(await dialog.locator('.legal-dialog-body').evaluate(el=>el.scrollHeight>el.clientHeight)).toBeTruthy();
 await dialog.getByRole('button',{name:'Done',exact:true}).click();await expect(dialog).toBeHidden();
});
