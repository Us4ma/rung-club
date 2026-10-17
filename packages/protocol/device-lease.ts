/** A short renewable lease prevents one account playing from two installations. */
export const DEVICE_LEASE_MS=90000;
export const DEVICE_SESSION_CONFLICT='This account is already active on another device. Select Reconnect to continue here and disconnect the other device.';
export type DeviceLease={device:string;expires:number;room?:string};
export function leaseDecision(current:DeviceLease|undefined,device:string,now:number,release=false,takeover=false){
 if(current&&current.expires>now&&current.device!==device&&!takeover)return {allowed:false,lease:current};
 return {allowed:true,lease:release?undefined:{device,expires:now+DEVICE_LEASE_MS,...((current?.device===device||takeover)&&current?.room?{room:current.room}:{})}};
}
