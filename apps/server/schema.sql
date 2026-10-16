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
