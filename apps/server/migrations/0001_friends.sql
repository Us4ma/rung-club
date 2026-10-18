-- Additive, idempotent social storage. Applied on first social use by ensureSocialSchema.
CREATE TABLE IF NOT EXISTS friendships(low_uid TEXT NOT NULL REFERENCES accounts(uid),high_uid TEXT NOT NULL REFERENCES accounts(uid),requester TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined','cancelled','expired')),created INTEGER NOT NULL,updated INTEGER NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(low_uid,high_uid),CHECK(low_uid<high_uid));
CREATE INDEX IF NOT EXISTS friendships_high ON friendships(high_uid,status);
CREATE TABLE IF NOT EXISTS friend_invites(id TEXT PRIMARY KEY,sender TEXT NOT NULL REFERENCES accounts(uid),target TEXT NOT NULL REFERENCES accounts(uid),room TEXT NOT NULL,mode TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','scheduled','joined','declined','expired','cancelled','failed')),created INTEGER NOT NULL,expires INTEGER NOT NULL,changed INTEGER NOT NULL,reason TEXT NOT NULL DEFAULT '');
CREATE UNIQUE INDEX IF NOT EXISTS friend_invite_pending ON friend_invites(sender,target) WHERE status IN ('pending','scheduled');
CREATE INDEX IF NOT EXISTS friend_invite_inbox ON friend_invites(target,status,expires);
CREATE INDEX IF NOT EXISTS friend_invite_outbox ON friend_invites(sender,changed);
