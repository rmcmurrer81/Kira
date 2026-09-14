-- Private D1 database. Never store this database or its exports in the public repo.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY, used INTEGER NOT NULL, expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS counters_expiry ON counters(expires);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY, session TEXT NOT NULL, created INTEGER NOT NULL,
  expires INTEGER NOT NULL, consent_version TEXT NOT NULL,
  question TEXT NOT NULL, answer TEXT NOT NULL, topic TEXT NOT NULL,
  mode TEXT NOT NULL, answered INTEGER NOT NULL, vote INTEGER NOT NULL DEFAULT 0,
  source_ids TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_session ON messages(session, created);
CREATE INDEX IF NOT EXISTS messages_created ON messages(created);
CREATE INDEX IF NOT EXISTS messages_expiry ON messages(expires);
CREATE TABLE IF NOT EXISTS knowledge_revisions (
  id TEXT PRIMARY KEY, topic_id TEXT NOT NULL, title TEXT NOT NULL,
  text TEXT NOT NULL, source_url TEXT NOT NULL, approved_at INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS knowledge_active ON knowledge_revisions(active, topic_id);
CREATE TABLE IF NOT EXISTS digests (
  week TEXT PRIMARY KEY, state TEXT NOT NULL, created INTEGER NOT NULL,
  payload TEXT, provider_id TEXT
);

-- Tombstones prevent an in-flight reply being saved after a deletion request.
CREATE TABLE IF NOT EXISTS deleted_sessions (session TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS deleted_sessions_expiry ON deleted_sessions(expires);
