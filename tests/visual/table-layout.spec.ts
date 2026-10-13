import {test as base,expect} from '@playwright/test';
const test=process.env.BROWSER_EXECUTABLE_PATH?base.extend({context:async({playwright},use)=>{const browser=await playwright.chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process','--no-zygote','--disable-software-rasterizer']});const context=await browser.newContext({baseURL:'http://127.0.0.1:5173'});await use(context);await browser.close();}}):base;
import fs from 'node:fs';
const out='docs/art/qa-table-overhaul';fs.mkdirSync(out,{recursive:true});
for(const [width,height] of [[1920,1080],[1366,768],[412,924],[390,844],[360,800],[844,390]])test(`${width}x${height} four seats, host, usable hand and table tools`,async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('welcome','1'));await page.setViewportSize({width,height});await page.goto('/');await page.getByRole('button',{name:'Play as a Guest',exact:true}).click();await page.getByRole('button',{name:'Practice table'}).click();
 for(let i=0;i<64;i++){await expect.poll(async()=>await page.locator('.hand button').count()===13||await page.getByRole('button',{name:'♣',exact:true}).isVisible()).toBe(true);if(await page.locator('.hand button').count()===13)break;await page.getByRole('button',{name:'♣',exact:true}).click();}
 await expect(page.locator('.hand button')).toHaveCount(13);await expect(page.locator('.hand button.legal').first()).toBeVisible({timeout:15000});await expect(page.locator('.table-host')).toHaveAttribute('data-dealer-state','waiting');await expect(page.locator('.deal-flights i')).toHaveCount(0);
 expect(await page.locator('[data-seat]').count()).toBe(4);expect(await page.locator('.seat-d-tag').count()).toBe(1);expect(await page.locator('.trick-slot').count()).toBe(4);
 const bounds=await page.evaluate(()=>{const rect=(s:string)=>{const r=document.querySelector(s)!.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};return {host:rect('.table-host'),right:rect('.seat-1'),partner:rect('.seat-2'),local:rect('.self-seat'),left:rect('.seat-3'),hand:rect('.hand'),scene:rect('.table-scene')};});
 const overlaps=(a:any,b:any)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 expect(overlaps(bounds.host,bounds.right)).toBe(false);expect(overlaps(bounds.host,bounds.partner)).toBe(false);expect(bounds.partner.y).toBeLessThan(bounds.local.y);expect(bounds.left.x).toBeLessThan(bounds.right.x);
 for(const slot of await page.locator('.trick-slot').all()){const r=(await slot.boundingBox())!;const box={x:r.x,y:r.y,w:r.width,h:r.height};for(const occupied of [bounds.partner,bounds.local,bounds.left,bounds.right])expect(overlaps(box,occupied)).toBe(false);}
 for(const card of await page.locator('.hand button').all()){const r=(await card.boundingBox())!;expect(r.width).toBeGreaterThanOrEqual(44);expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(width);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Your table profile'}).click();await expect(page.getByRole('dialog',{name:'Your table profile'})).toBeVisible();await page.getByRole('button',{name:'Close profile'}).click();await page.getByRole('button',{name:'Table settings'}).click();await expect(page.getByLabel('Animations')).toBeVisible();await page.getByRole('button',{name:'Close table settings'}).click();
 await page.screenshot({path:`${out}/${width}x${height}.png`,fullPage:true});expect(errors).toEqual([]);
});
