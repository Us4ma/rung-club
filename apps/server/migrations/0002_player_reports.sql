CREATE TABLE IF NOT EXISTS player_reports(id TEXT PRIMARY KEY,reporter TEXT NOT NULL REFERENCES accounts(uid),target TEXT NOT NULL,target_kind TEXT NOT NULL,target_name TEXT NOT NULL,reason TEXT NOT NULL,details TEXT NOT NULL,room TEXT,match_id TEXT,created INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','reviewed','dismissed','action_taken')),review_notes TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS player_reports_review ON player_reports(status,created);
CREATE INDEX IF NOT EXISTS player_reports_sender ON player_reports(reporter,created);
