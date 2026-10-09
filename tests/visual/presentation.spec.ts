import {test as base,expect,type Page} from '@playwright/test';
const test=process.env.BROWSER_EXECUTABLE_PATH?base.extend({context:async({playwright},use)=>{const browser=await playwright.chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process','--no-zygote','--disable-software-rasterizer']});const context=await browser.newContext({baseURL:'http://127.0.0.1:5173'});await use(context);await browser.close();}}):base;
import fs from 'node:fs';
const output=process.env.QA_SCREENSHOT_DIR||'test-results/art-qa';
fs.mkdirSync(output,{recursive:true});
async function chooseOpenTrump(page:Page){for(let attempt=0;attempt<12;attempt++){await page.getByRole('button',{name:'♣',exact:true}).click();await page.waitForTimeout(60);if(await page.locator('.hand button').count()===13)return;}throw Error('Valid deal not reached within UI test redeal limit');}
for(const [name,width,height] of [['desktop',1440,1000],['portrait',390,844],['landscape',844,390],['small-phone',320,640]] as const){
 test(name+' hand stays readable and playable',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height});await page.goto('/');await page.getByRole('button',{name:'Play as a guest'}).click();
  await expect(page.locator('.splash')).toHaveCount(0);
  await page.screenshot({path:output+'/'+name+'-lobby.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Practice table'}).click();await chooseOpenTrump(page);
  const hand=page.locator('.hand');await expect(hand.locator('button')).toHaveCount(13);
  await expect.poll(()=>page.locator('.hand img').evaluateAll(imgs=>imgs.filter(img=>!(img as HTMLImageElement).naturalWidth).map(img=>(img as HTMLImageElement).src))).toEqual([]);
  const last=hand.locator('button').last();await last.scrollIntoViewIfNeeded();await expect(last).toBeInViewport();
  expect((await last.boundingBox())!.width).toBeGreaterThanOrEqual(44);
  if(width<=360)expect(await hand.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  if(width===390)expect(await hand.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  const legal=hand.locator('button.legal').first();await legal.scrollIntoViewIfNeeded();await legal.click();await expect(legal).toHaveClass(/selected/);
  const action=page.getByRole('button',{name:'Play card →'});await action.scrollIntoViewIfNeeded();await expect(action).toBeEnabled();
  await page.screenshot({path:output+'/'+name+'-table.png',fullPage:true});await action.click();await expect(hand.locator('button')).toHaveCount(12);
  await page.waitForTimeout(1000);await page.screenshot({path:output+'/'+name+'-table-in-play.png',fullPage:true});
  expect(errors).toEqual([]);
 });
}
test('roster, collection, hidden mode and tutorial retain working flows',async({page})=>{
 await page.goto('/');const missing=await page.evaluate(async()=>{const ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];const paths=ranks.flatMap(r=>['S','H','D','C'].map(s=>'/art/house/cards/'+r+s+'.svg'));return(await Promise.all(paths.map(path=>new Promise<string>(resolve=>{const img=new Image();img.onload=()=>resolve('');img.onerror=()=>resolve(path);img.src=path;})))).filter(Boolean);});expect(missing).toEqual([]);await page.getByRole('button',{name:'Play as a guest'}).click();await page.getByRole('button',{name:'◉ Your profile',exact:true}).click();
 await expect(page.locator('.avatar-roster button')).toHaveCount(12);await page.getByRole('button',{name:'Avatar 8',exact:true}).click();await page.reload();expect(await page.evaluate(()=>localStorage.getItem('avatar'))).toBe('8');
 await page.getByRole('button',{name:'♧ Collection',exact:true}).click();await page.getByRole('button',{name:'ruby Owned · Equip'}).click();expect(await page.evaluate(()=>localStorage.getItem('cardBack'))).toBe('ruby');
 await page.getByText('← Back to lobby',{exact:true}).click();await page.locator('.mode-tile.band').click();await expect(page.locator('.mode-tile.band')).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Practice table'}).click();await expect(page.getByText('Choose your Rung',{exact:true})).toBeVisible();await page.locator('.hand button').first().click();await expect(page.getByText('HIDDEN RUNG',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'← Lobby',exact:true}).click();await page.getByRole('button',{name:'Learn the art of Rung'}).click();await expect(page.locator('.lesson img.dealer')).toBeVisible();await page.getByText('Next lesson',{exact:true}).click();await expect(page.getByText(/Follow the suit led/)).toBeVisible();
});
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844],['small',320,640],['landscape',844,390]] as const){
 test(name+' login is usable and guest reaches lobby',async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');await expect(page.getByRole('heading',{name:'Take your seat.'})).toBeVisible();await expect(page.locator('.splash')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:output+'/'+name+'-login.png',fullPage:true});
  await page.getByLabel('Email address',{exact:true}).fill('player@example.com');await page.getByLabel('Password',{exact:true}).fill('sample-password');await page.getByRole('button',{name:'Show password'}).click();await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','text');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('alert')).toContainText('not configured');await expect(page.locator('.entry-screen')).toBeVisible();
  await page.getByRole('button',{name:'Play as a guest'}).click();await expect(page.locator('.lobby')).toBeVisible();await page.reload();await expect(page.locator('.lobby')).toBeVisible();
  await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.locator('.entry-screen')).toBeVisible();await page.reload();await expect(page.locator('.entry-screen')).toBeVisible();
 });
}
for(const [name,width,height] of [['desktop',1440,900],['portrait',390,844],['landscape',844,390],['small',320,640]] as const){
 test(name+' has four seats, separate host, readable panels and unobstructed play',async({page})=>{
  await page.setViewportSize({width,height});await page.goto('/');await page.getByRole('button',{name:'Play as a guest'}).click();
  await page.getByRole('button',{name:'Private Room',exact:false}).click();await expect(page.getByLabel('Room code')).toBeVisible();await page.getByLabel('Room code').fill('ab12');await expect(page.getByLabel('Room code')).toHaveValue('AB12');
  await page.getByRole('button',{name:'Practice table'}).click();await chooseOpenTrump(page);
  await expect(page.locator('[data-seat]')).toHaveCount(4);await expect(page.locator('.table-host')).toHaveCount(1);await expect(page.locator('.table-host img')).toBeVisible();
  const collision=await page.evaluate(()=>{const host=document.querySelector('.table-host')!.getBoundingClientRect();const intersect=(r:DOMRect)=>Math.min(host.right,r.right)>Math.max(host.left,r.left)&&Math.min(host.bottom,r.bottom)>Math.max(host.top,r.top);return [...document.querySelectorAll('.seat,.self-seat,.center,.hand,.scorebar')].some(el=>intersect(el.getBoundingClientRect()));});expect(collision).toBe(false);
  const hand=page.locator('.hand');await expect(hand.locator('button')).toHaveCount(13);await expect(page.locator('.scorebar')).toBeVisible();
  const card=hand.locator('.legal').last();await card.scrollIntoViewIfNeeded();await card.focus();await page.keyboard.press('Enter');await expect(card).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Reactions',exact:true}).click();await expect(page.getByRole('group',{name:'Quick reactions'})).toBeVisible();
  const menu=await page.getByRole('group',{name:'Quick reactions'}).boundingBox();const cardArea=await hand.boundingBox();expect(Math.min(menu!.x+menu!.width,cardArea!.x+cardArea!.width)<=Math.max(menu!.x,cardArea!.x)||Math.min(menu!.y+menu!.height,cardArea!.y+cardArea!.height)<=Math.max(menu!.y,cardArea!.y)).toBe(true);
  await page.getByRole('button',{name:'Good luck',exact:true}).click();await expect(page.getByRole('group',{name:'Quick reactions'})).toHaveCount(0);
  await page.getByRole('button',{name:'Play card →'}).click();await expect(hand.locator('button')).toHaveCount(12);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('cancelled drags do not play; valid central drops do',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Play as a guest'}).click();await page.getByRole('button',{name:'Practice table'}).click();await chooseOpenTrump(page);
 const hand=page.locator('.hand');const card=hand.locator('.legal').first();await card.dispatchEvent('dragend');await expect(hand.locator('button')).toHaveCount(13);
 const transfer=await page.evaluateHandle(()=>new DataTransfer());await card.dispatchEvent('dragstart',{dataTransfer:transfer});await page.locator('.plays').dispatchEvent('drop',{dataTransfer:transfer});await expect(hand.locator('button')).toHaveCount(12);
});
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844],['landscape',844,390]] as const){
 test(name+' settings and complete avatar frames fit',async({page})=>{
 await page.setViewportSize({width,height});await page.goto('/');await page.getByRole('button',{name:'Play as a guest'}).click();await page.locator('header').getByRole('button',{name:'Settings',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Protect your guest account'})).toBeVisible();
 const checkbox=page.getByRole('switch',{name:'Vibration'});await checkbox.check();expect(await checkbox.isChecked()).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await checkbox.evaluate(el=>getComputedStyle(el).width)).toBe('44px');
 await page.screenshot({path:output+'/'+name+'-settings.png',fullPage:true});
 await page.getByRole('button',{name:'← Back to lobby',exact:true}).click();await page.getByRole('button',{name:'◉ Your profile',exact:true}).click();
 await expect(page.locator('.avatar-roster button')).toHaveCount(12);
 expect(await page.locator('.avatar-roster img').first().evaluate(el=>getComputedStyle(el).borderRadius)).toBe('0px');
 await page.getByRole('button',{name:'Avatar 12',exact:true}).click();expect(await page.evaluate(()=>localStorage.getItem('avatar'))).toBe('12');
 await page.screenshot({path:output+'/'+name+'-avatars.png',fullPage:true});
 });
}
test('game lobby progress and settings drawer are usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Play as a guest'}).click();
 await expect(page.getByRole('progressbar',{name:'Level progress'})).toHaveAttribute('aria-valuenow','0');
 const tiles=await page.locator('.game-tile').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width};}));expect(Math.abs(tiles[0].width-tiles[3].width)).toBeLessThan(2);expect(tiles[0].y).toBe(tiles[1].y);expect(tiles[2].y).toBe(tiles[3].y);
 await page.locator('header').getByRole('button',{name:'Settings',exact:true}).click();await expect(page.getByRole('dialog',{name:'Settings'})).toBeVisible();await expect(page.locator('.lobby-background')).toHaveAttribute('inert','');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('header').getByRole('button',{name:'Settings',exact:true})).toBeFocused();
});
