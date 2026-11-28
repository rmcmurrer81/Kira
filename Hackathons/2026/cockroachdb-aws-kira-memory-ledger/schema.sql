-- Proposed CockroachDB schema for the final hackathon implementation.
-- This file has not been applied to a live cluster yet.

CREATE TABLE IF NOT EXISTS memory_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id STRING NOT NULL,
    revision INT8 NOT NULL,
    subject STRING NOT NULL,
    text STRING NOT NULL,
    occurred_at TIMESTAMPTZ NULL,
    status STRING NOT NULL CHECK (status IN ('proposed', 'accepted', 'historical', 'revoked')),
    visibility STRING NOT NULL CHECK (visibility IN ('private', 'shared', 'public')),
    source_label STRING NOT NULL,
    supersedes_revision INT8 NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    previous_event_sha256 STRING NOT NULL,
    event_sha256 STRING NOT NULL UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    UNIQUE (memory_id, revision)
);

CREATE INDEX IF NOT EXISTS memory_events_subject_created_idx
    ON memory_events (subject, created_at DESC);

CREATE INDEX IF NOT EXISTS memory_events_memory_revision_idx
    ON memory_events (memory_id, revision DESC);

CREATE TABLE IF NOT EXISTS memory_embeddings (
    memory_id STRING NOT NULL,
    revision INT8 NOT NULL,
    embedding VECTOR(1024) NOT NULL,
    model_id STRING NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (memory_id, revision),
    FOREIGN KEY (memory_id, revision)
        REFERENCES memory_events (memory_id, revision)
        ON DELETE CASCADE
);

-- The final implementation should add CockroachDB distributed vector indexing
-- using the exact current syntax supported by the provisioned cluster version.
