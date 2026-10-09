export interface AdProvider{rewarded():Promise<{verified:boolean}>;interstitial():Promise<boolean>}
export class TestAds implements AdProvider{async rewarded(){return {verified:false};}async interstitial(){return false;}}
export function eligibleInterstitial(completed:number,last:number,now=Date.now(),tutorial=false,reconnecting=false){return !tutorial&&!reconnecting&&completed>0&&completed%3===0&&now-last>=10*60*1000;}
