import {it,expect,vi} from 'vitest';
import {RoomConnection} from '../apps/web/room-connection.ts';
it('a refused WebSocket uses HTTPS for snapshots and commands, including leave on close',async()=>{
 let socket:any;class RefusedSocket{onopen:any;onclose:any;onerror:any;onmessage:any;readyState=0;constructor(){socket=this;}close(){this.readyState=3;}}
 vi.stubGlobal('WebSocket',RefusedSocket);
 const state={type:'state',seq:0,view:{matchId:'one',revision:0},events:[]};
 const request=vi.fn(async(path:string)=>path==='table-state'?{state}:{messages:[{type:'ack'}],state:{...state,seq:1,view:{...state.view,revision:1}}});
 const connection=new RoomConnection('wss://example.test/socket',request,'ABCD1234'),received:any[]=[];connection.onmessage=e=>received.push(JSON.parse(e.data));
 socket.onerror();await vi.waitFor(()=>expect(connection.readyState).toBe(1));expect(received[0].type).toBe('state');
 connection.send(JSON.stringify({type:'start'}));await vi.waitFor(()=>expect(received.some(m=>m.type==='ack')).toBe(true));
 connection.send(JSON.stringify({type:'leave'}));connection.close();await vi.waitFor(()=>expect(request.mock.calls.filter(c=>c[0]==='table-command')).toHaveLength(2));
 vi.unstubAllGlobals();
});
