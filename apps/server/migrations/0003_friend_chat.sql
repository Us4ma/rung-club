CREATE TABLE IF NOT EXISTS friend_messages(seq INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT NOT NULL UNIQUE,sender TEXT NOT NULL REFERENCES accounts(uid),recipient TEXT NOT NULL REFERENCES accounts(uid),low_uid TEXT NOT NULL,high_uid TEXT NOT NULL,text TEXT NOT NULL,created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS friend_messages_thread ON friend_messages(low_uid,high_uid,seq);
CREATE INDEX IF NOT EXISTS friend_messages_sender ON friend_messages(sender,created);
CREATE TABLE IF NOT EXISTS friend_chat_reads(uid TEXT NOT NULL REFERENCES accounts(uid),peer TEXT NOT NULL REFERENCES accounts(uid),read_seq INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(uid,peer));
CREATE INDEX IF NOT EXISTS friend_messages_inbox ON friend_messages(recipient,seq,sender);
