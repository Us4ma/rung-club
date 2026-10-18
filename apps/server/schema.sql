PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS accounts(uid TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE COLLATE NOCASE, created INTEGER NOT NULL, revoked_before INTEGER NOT NULL DEFAULT 0, deleted INTEGER NOT NULL DEFAULT 0, tutorial INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,uid TEXT NOT NULL REFERENCES accounts(uid),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS results(match_id TEXT NOT NULL,uid TEXT NOT NULL,team INTEGER NOT NULL,won INTEGER NOT NULL,score INTEGER NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(match_id,uid));
CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY,uid TEXT NOT NULL REFERENCES accounts(uid),amount INTEGER NOT NULL,xp INTEGER NOT NULL,kind TEXT NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cosmetics(uid TEXT NOT NULL REFERENCES accounts(uid),item TEXT NOT NULL,PRIMARY KEY(uid,item));
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE INDEX IF NOT EXISTS ledger_account ON ledger(uid);

-- Persistent roster records are separate from authenticated human accounts.
CREATE TABLE IF NOT EXISTS roster_results(match_id TEXT NOT NULL,roster_id TEXT NOT NULL,seat INTEGER NOT NULL,won INTEGER NOT NULL,sars INTEGER NOT NULL,outcome TEXT NOT NULL,points INTEGER NOT NULL,mode TEXT NOT NULL,created INTEGER NOT NULL,history TEXT NOT NULL,source TEXT NOT NULL,PRIMARY KEY(match_id,roster_id));
CREATE INDEX IF NOT EXISTS roster_result_player ON roster_results(roster_id,created);
-- Additive, idempotent social storage. Applied on first social use by ensureSocialSchema.
CREATE TABLE IF NOT EXISTS friendships(low_uid TEXT NOT NULL REFERENCES accounts(uid),high_uid TEXT NOT NULL REFERENCES accounts(uid),requester TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','accepted','declined','cancelled','expired')),created INTEGER NOT NULL,updated INTEGER NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(low_uid,high_uid),CHECK(low_uid<high_uid));
CREATE INDEX IF NOT EXISTS friendships_high ON friendships(high_uid,status);
CREATE TABLE IF NOT EXISTS friend_invites(id TEXT PRIMARY KEY,sender TEXT NOT NULL REFERENCES accounts(uid),target TEXT NOT NULL REFERENCES accounts(uid),room TEXT NOT NULL,mode TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('pending','scheduled','joined','declined','expired','cancelled','failed')),created INTEGER NOT NULL,expires INTEGER NOT NULL,changed INTEGER NOT NULL,reason TEXT NOT NULL DEFAULT '');
CREATE UNIQUE INDEX IF NOT EXISTS friend_invite_pending ON friend_invites(sender,target) WHERE status IN ('pending','scheduled');
CREATE INDEX IF NOT EXISTS friend_invite_inbox ON friend_invites(target,status,expires);
CREATE INDEX IF NOT EXISTS friend_invite_outbox ON friend_invites(sender,changed);
