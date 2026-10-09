import {test as base,expect} from '@playwright/test';
const test=process.env.BROWSER_EXECUTABLE_PATH?base.extend({context:async({playwright},use)=>{const browser=await playwright.chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process','--no-zygote','--disable-software-rasterizer']});const context=await browser.newContext({baseURL:'http://127.0.0.1:5173'});await use(context);await browser.close();}}):base;
import fs from 'node:fs';
const output=process.env.QA_SCREENSHOT_DIR||'test-results/art-qa';
fs.mkdirSync(output,{recursive:true});
for(const [name,width,height] of [['desktop',1440,1000],['portrait',390,844],['landscape',844,390],['small-phone',320,640]] as const){
 test(name+' hand stays readable and playable',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height});await page.goto('/');await page.getByText('Skip Tutorial',{exact:true}).click();
  await expect(page.locator('.splash')).toHaveCount(0);
  await page.screenshot({path:output+'/'+name+'-lobby.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Practice table'}).click();await page.getByRole('button',{name:'♣',exact:true}).click();
  const hand=page.locator('.hand');await expect(hand.locator('button')).toHaveCount(13);
  await expect.poll(()=>page.locator('.hand img').evaluateAll(imgs=>imgs.filter(img=>!(img as HTMLImageElement).naturalWidth).map(img=>(img as HTMLImageElement).src))).toEqual([]);
  const last=hand.locator('button').last();await last.scrollIntoViewIfNeeded();await expect(last).toBeInViewport();
  expect((await last.boundingBox())!.width).toBeGreaterThanOrEqual(44);
  if(width<=600)expect(await hand.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  const legal=hand.locator('button.legal').first();await legal.scrollIntoViewIfNeeded();await legal.click();await expect(legal).toHaveClass(/selected/);
  const action=page.getByRole('button',{name:'Play card →'});await action.scrollIntoViewIfNeeded();await expect(action).toBeEnabled();
  await page.screenshot({path:output+'/'+name+'-table.png',fullPage:true});await action.click();await expect(hand.locator('button')).toHaveCount(12);
  expect(errors).toEqual([]);
 });
}
test('roster, collection, hidden mode and tutorial retain working flows',async({page})=>{
 await page.goto('/');const missing=await page.evaluate(async()=>{const ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];const paths=ranks.flatMap(r=>['S','H','D','C'].map(s=>'/art/cards/'+r+s+'.webp'));return(await Promise.all(paths.map(path=>new Promise<string>(resolve=>{const img=new Image();img.onload=()=>resolve('');img.onerror=()=>resolve(path);img.src=path;})))).filter(Boolean);});expect(missing).toEqual([]);await page.getByText('Skip Tutorial',{exact:true}).click();await page.getByRole('button',{name:'◉ Your profile',exact:true}).click();
 await expect(page.locator('.avatar-roster button')).toHaveCount(12);await page.getByRole('button',{name:'Avatar 8',exact:true}).click();await page.reload();expect(await page.evaluate(()=>localStorage.getItem('avatar'))).toBe('8');
 await page.getByRole('button',{name:'♧ Collection',exact:true}).click();await page.getByRole('button',{name:'ruby Owned · Equip'}).click();expect(await page.evaluate(()=>localStorage.getItem('cardBack'))).toBe('ruby');
 await page.getByText('← Back to lobby',{exact:true}).click();await page.locator('.mode-tile.band').click();await expect(page.locator('.mode-tile.band')).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Practice table'}).click();await expect(page.getByText('Choose your Rung',{exact:true})).toBeVisible();await page.locator('.hand button').first().click();await expect(page.getByText('HIDDEN RUNG',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'← Lobby',exact:true}).click();await page.getByRole('button',{name:'Learn the art of Rung'}).click();await expect(page.locator('.lesson img.dealer')).toBeVisible();await page.getByText('Next lesson',{exact:true}).click();await expect(page.getByText(/Follow the suit led/)).toBeVisible();
});
