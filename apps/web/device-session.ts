export function deviceID(){let id=localStorage.getItem('rung:device-id');if(!id){id=crypto.randomUUID();localStorage.setItem('rung:device-id',id);}return id;}
export const deviceHeaders=()=>({'X-Device-ID':deviceID()});
