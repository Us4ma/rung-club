/** A short renewable lease prevents one account playing from two installations. */
export const DEVICE_LEASE_MS=90000;
export const DEVICE_SESSION_CONFLICT='This account is already active on another device. Sign out there before continuing here.';
export type DeviceLease={device:string;expires:number};
export function leaseDecision(current:DeviceLease|undefined,device:string,now:number,release=false){
 if(current&&current.expires>now&&current.device!==device)return {allowed:false,lease:current};
 return {allowed:true,lease:release?undefined:{device,expires:now+DEVICE_LEASE_MS}};
}
