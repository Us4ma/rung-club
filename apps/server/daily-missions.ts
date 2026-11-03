export async function dailyMissions(db:D1Database,uid:string,input:{action:string;day?:string}){
 const now=Date.now(),day=new Date(now).toISOString().slice(0,10),start=Date.parse(day+'T00:00:00Z'),end=start+86400000;
 if(input.action==='claim-missions'&&input.day!==day)return Response.json({error:'A new mission day has started. Reopen Daily Missions to refresh.'},{status:409});
 const rows=await db.prepare("SELECT COUNT(*) deals,COALESCE(SUM(r.score),0) sars,COALESCE(SUM(r.won),0) wins,COUNT(sp.id) spades,COUNT(ac.id) aces,COALESCE(SUM(CASE WHEN r.score>=4 THEN 1 ELSE 0 END),0) competitive,CASE WHEN r.created>=? THEN 1 ELSE 0 END today FROM results r JOIN ledger l ON l.id='mission-deal:'||r.match_id||':'||r.uid LEFT JOIN ledger sp ON sp.id='mission-spades:'||r.match_id||':'||r.uid LEFT JOIN ledger ac ON ac.id='mission-ace:'||r.match_id||':'||r.uid WHERE r.uid=? AND r.created>=? AND r.created<? GROUP BY today").bind(start,uid,start-14*86400000,end).all<{deals:number;sars:number;wins:number;competitive:number;spades:number;aces:number;today:number}>();
 const empty={deals:0,sars:0,wins:0,competitive:0,spades:0,aces:0},past=rows.results.find(r=>!r.today)??empty,today=rows.results.find(r=>r.today)??empty;
 const experienced=past.deals>=20&&past.wins/past.deals>=.55;
 let seed=2166136261;
 for(const ch of uid)seed=Math.imul(seed^ch.charCodeAt(0),16777619);
 const order=(seed&1)?[0,1,2]:[0,2,1];
 const variant=order[(Math.floor(start/86400000)+(seed>>>0)%3)%3];
 const card=(ace:boolean,target:number)=>({title:'Win a Sar with '+(ace?'an ace':'a spade')+' in '+target+' '+(target===1?'deal':'different deals'),target,progress:ace?today.aces:today.spades});
 const deals=(target:number)=>({title:target===1?'Finish an Open Rung deal':'Finish '+target+' Open Rung deals',target,progress:today.deals});
 const hardest=experienced?4:3;
 const boards=[
  [deals(1),card(false,2),card(true,hardest)],
  [card(true,1),deals(2),card(false,hardest)],
  [card(false,1),card(true,2),deals(experienced?5:4)]
 ];
 const goals=boards[variant].map((goal,i)=>({...goal,id:['easy','tough','toughest'][i],coins:[75,125,200][i]}));
 const key=(id:string)=>'daily-mission:'+uid+':'+day+':'+id;
 let credited=0;
 if(input.action==='claim-missions'){
  const ready=goals.filter(g=>g.progress>=g.target);
  if(ready.length){const writes=await db.batch(ready.map(g=>db.prepare("INSERT OR IGNORE INTO ledger(id,uid,amount,xp,kind,created) SELECT ?,?,?,0,'daily-mission',? WHERE EXISTS(SELECT 1 FROM accounts WHERE uid=? AND deleted=0)").bind(key(g.id),uid,g.coins,Date.now(),uid)));credited=ready.reduce((sum,g,i)=>sum+(writes[i].meta.changes?g.coins:0),0);}
 }
 const claims=await db.prepare("SELECT id FROM ledger WHERE uid=? AND kind='daily-mission' AND id IN (?,?,?)").bind(uid,...goals.map(g=>key(g.id))).all<{id:string}>();
 return Response.json({day,resetsAt:end,credited,goals:goals.map(g=>({...g,progress:Math.min(g.progress,g.target),claimed:claims.results.some(r=>r.id===key(g.id))}))},{headers:{'Cache-Control':'no-store'}});
}
