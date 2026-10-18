export type FriendRelation={status:'self'|'none'|'friends'|'incoming'|'sent';canResend?:boolean;updated?:number};
export type SocialPlayer={uid:string;name:string;avatar:number;photoURL?:string;level:number;online:boolean;playing:boolean};
export type FriendRequest={player:SocialPlayer;updated:number;expires:number;canResend:boolean};
export type GameInvite={id:string;sender:SocialPlayer;target:SocialPlayer;mode:'open'|'band';status:'pending'|'scheduled'|'joined'|'declined'|'expired'|'cancelled'|'failed';expires:number;changed:number;room?:string;reason?:string};
export type FriendsState={friends:SocialPlayer[];incoming:FriendRequest[];sent:FriendRequest[];invites:GameInvite[];serverNow:number};
export type SocialAction={action:'request'|'accept-request'|'decline-request'|'cancel-request'|'remove-friend'|'invite'|'accept-invite'|'decline-invite'|'cancel-invite';target?:string;id?:string;room?:string;mode?:'open'|'band';newMatch?:boolean};
export const FRIEND_REQUEST_TTL=7*86400000,FRIEND_RESEND_MS=86400000,FRIEND_INVITE_MS=45000;
