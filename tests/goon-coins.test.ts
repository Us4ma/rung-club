import {beforeEach,afterEach,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {coinAction,coinState} from '../apps/server/coins.ts';
let sql:DatabaseSync,db:any;
function statement(s:string,args:any[]=[]):any{return {bind:(...v:any[])=>statement(s,v),first:async()=>sql.prepare(s).get(...args)||null,all:async()=>({results:sql.prepare(s).all(...args)}),run:async()=>({meta:{changes:Number(sql.prepare(s).run(...args).changes)}})};}
beforeEach(()=>{sql=new DatabaseSync(':memory:');sql.exec(readFileSync('apps/server/schema.sql','utf8'));db={prepare:(s:string)=>statement(s),batch:async(items:any[])=>{sql.exec('BEGIN');try{const result=[];for(const i of items)result.push(await i.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};for(const uid of ['a','b','c','d'])sql.prepare('INSERT INTO accounts(uid,name,created) VALUES(?,?,?)').run(uid,uid,Date.now());});
afterEach(()=>sql.close());
async function act(uid:string,body:any){const r=await coinAction(db,uid,body);expect(r.status).toBe(200);return r.json() as Promise<any>;}
async function seated(){for(const uid of ['a','b','c','d'])await act(uid,{action:'welcome'});await act('room',{action:'prepare',room:'ABCD1234',players:['a','b','c','d']});}
it('blocks an underfunded caller partner, then settles 4x exactly once and releases unused reserves',async()=>{
 await seated();const room='ABCD1234',players=['a','b','c','d'],caller=0;
 sql.prepare('UPDATE coin_tables SET balance=799 WHERE uid=?').run('c');
 expect((await coinAction(db,'room',{action:'reserve',room,players,caller,deal:'blocked'})).status).toBe(409);
 expect(sql.prepare('SELECT id FROM coin_deals').all()).toHaveLength(0);
 sql.prepare('UPDATE coin_tables SET balance=2500 WHERE uid=?').run('c');
 for(const deal of ['goon','kot','refund']){
  const before=await Promise.all(players.map(p=>coinState(db,p)));
  const reserve={action:'reserve',room,players,caller,deal};await act('room',reserve);await act('room',reserve);
  const held=await act('room',{action:'restore',room,players,deal});expect(held.balances).toEqual(before.map(s=>s.table!.balance-200));
  const settlement={action:'settle',room,deal,winner:1,outcome:deal==='kot'?'kot':'goon-kot',refund:deal==='refund'};
  const plan=await act('room',settlement);await act('room',settlement);
  for(let seat=0;seat<4;seat++)expect((await coinState(db,players[seat])).table!.balance).toBe(before[seat].table!.balance-plan.contributions[seat]+plan.payouts[seat]);
  expect(plan.extra).toBe(deal==='goon'?600:0);
 }
});
