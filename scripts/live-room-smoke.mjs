// Optional live QA: uses a NEW in-memory anonymous identity, never an owner's account.
// No tokens/cookies/UIDs are logged. Cleans up only the identity this process creates.
import {readFileSync} from 'node:fs';
import {initializeApp,deleteApp} from 'firebase/app';
import {initializeAuth,inMemoryPersistence,signInAnonymously,deleteUser} from 'firebase/auth';
import {WebSocket} from 'ws';
import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';
// ws uses its own HTTPS agent; Node’s fetch proxy flag does not configure that transport.
function websocketAgent(){const address=process.env.HTTPS_PROXY||process.env.https_proxy||process.env.HTTP_PROXY||process.env.http_proxy;if(!address)return undefined;const proxy=new URL(address),agent=new https.Agent();agent.createConnection=(options,callback)=>{const destination=options.host+':'+(options.port||443),headers={Host:destination};if(proxy.username)headers['Proxy-Authorization']='Basic '+Buffer.from(decodeURIComponent(proxy.username)+':'+decodeURIComponent(proxy.password)).toString('base64');const request=(proxy.protocol==='https:'?https:http).request({hostname:proxy.hostname,port:proxy.port||undefined,method:'CONNECT',path:destination,headers,agent:false});request.once('connect',(response,socket)=>{if(response.statusCode!==200){socket.destroy();callback(Error('QA proxy refused the WebSocket tunnel'));return;}const secure=tls.connect({socket,servername:options.host});secure.once('secureConnect',()=>callback(null,secure));secure.once('error',callback);});request.once('error',callback);request.end();};return agent;}
const config=readFileSync(new URL('../apps/web/deployment.ts',import.meta.url),'utf8');
const origin=config.match(/ONLINE_ORIGIN = '([^']+)'/)[1];
const publicConfig=Object.fromEntries(['apiKey','authDomain','projectId'].map(k=>[k,config.match(new RegExp(k+": '([^']+)'"))[1]]));
const app=initializeApp(publicConfig,'rung-live-qa-'+crypto.randomUUID()),auth=initializeAuth(app,{persistence:inMemoryPersistence});
let user,cookie,ws,current,closed=false,failed;const complete=process.argv.includes('--complete-deal');
async function api(path,body={}){const r=await fetch(origin+'/api/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];if(!r.ok)throw Error('API '+path+' returned '+r.status);return r.json();}
async function waitFor(predicate,ms=12000){if(predicate())return;await new Promise((resolve,reject)=>{const t=setTimeout(()=>{clearInterval(i);reject(Error('Live room wait timed out'));},ms),i=setInterval(()=>{if(failed){clearTimeout(t);clearInterval(i);reject(failed);}else if(predicate()){clearTimeout(t);clearInterval(i);resolve();}},40);});}
function command(type,card){ws.send(JSON.stringify({type,card,matchId:current.view.matchId,id:crypto.randomUUID(),seq:current.seq+1,revision:current.view.revision}));}
try{
 user=(await signInAnonymously(auth)).user;if(!user.isAnonymous)throw Error('QA safety guard: unexpected permanent identity');
 await api('session',{token:await user.getIdToken()});const {code}=await api('rooms',{mode:'open'});
 ws=new WebSocket(origin.replace('https','wss')+'/socket?code='+code,{headers:{Cookie:cookie,Origin:origin},agent:websocketAgent(),handshakeTimeout:12000});
 ws.on('message',raw=>{const d=JSON.parse(String(raw));if(d.type==='state')current=d;if(d.type==='closed')closed=true;if(d.type==='error')failed=Error('Live room rejected an action');});
 await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});await waitFor(()=>!!current);
 if(current.view.policy.version!=='double-sar-v3-continuous')throw Error('Live Worker still uses an older rules preset');
 if(current.view.opening?.rounds[0]?.cards.length!==4||current.view.opening.winner!==current.view.caller)throw Error('Live opening contest mismatch');
 if(current.view.dealer!==(current.view.caller+1)%4||current.view.counts.some(n=>n!==5)||'hands' in current.view||'stock' in current.view)throw Error('Initial live seat/deal/redaction check failed');
 ws.send(JSON.stringify({type:'ready'}));await waitFor(()=>current.ready[0]);ws.send(JSON.stringify({type:'start'}));await waitFor(()=>current.started);
 for(let attempt=0;attempt<64&&current.view.phase==='calling';attempt++){await waitFor(()=>current.view.phase==='playing'||current.view.turn===0);if(current.view.phase==='playing')break;const revision=current.view.revision;command('call','H');await waitFor(()=>current.view.revision>revision);}
 await waitFor(()=>current.view.phase==='playing');if(current.view.counts.some(n=>n!==13))throw Error('Live full deal did not allocate 13 cards each');
 await waitFor(()=>current.view.turn===0);const revision=current.view.revision,owned=current.view.hand.length;command('play',current.view.legal[0]);await waitFor(()=>current.view.revision>revision);if(current.view.hand.length!==owned-1)throw Error('Live legal play was not accepted exactly once');
 let settled=false,continued=false,awarded=0;
 if(complete){const first=current.view.matchId;let actions=0;while(current.view.matchId===first&&current.view.phase!=='finished'&&actions++<30){await waitFor(()=>current.view.phase==='finished'||current.view.turn===0);if(current.view.phase==='finished')break;const old=current.view.revision;command('play',current.view.legal[0]);await waitFor(()=>current.view.revision>old);}await waitFor(()=>current.view.phase==='finished');const done=current.view,summary=done.table.rounds.at(-1);if(done.history.length!==13||done.scores.reduce((a,b)=>a+b,0)!==13)throw Error('Live full-deal conservation failed');const expected=done.scores[summary.winnerTeam]===13?(summary.winnerTeam===done.caller%2?13:26):0;if(summary.points!==expected||!summary.eligible)throw Error('Live settlement points mismatch');settled=true;awarded=summary.points;await waitFor(()=>current.view.matchId!==first,6000);if(current.view.table.id!==done.table.id||current.view.table.dealNumber!==2||JSON.stringify(current.view.table.points)!==JSON.stringify(done.table.points)||current.view.opening!==undefined||current.view.dealer!==(current.view.caller+1)%4)throw Error('Live successor deal lost table state');continued=true;}
 ws.send(JSON.stringify({type:'leave'}));await waitFor(()=>closed,5000);
 console.log(JSON.stringify({rules:current.view.policy.version,initialComparison:4,openingCardsPerSeat:5,fullCardsPerSeat:13,dealerConvention:true,privateHandsRedacted:true,legalActionAccepted:true,lastHumanExitClosedRoom:true,fullDealSettled:settled,automaticNextDeal:continued,matchPointsAwarded:awarded}));
}catch(e){process.exitCode=1;console.error(e.message);}
finally{
 if(ws&&ws.readyState===WebSocket.OPEN){ws.send(JSON.stringify({type:'leave'}));ws.close();}
 if(user?.isAnonymous){try{if(cookie)await api('delete-account');await deleteUser(user);console.log('Temporary anonymous QA identity cleaned up.');}catch{process.exitCode=1;console.error('QA cleanup needs retry; no owner identity was touched.');}}
 await deleteApp(app);
}
