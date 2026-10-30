-- Additive schema install. Does not modify any existing creator history.
CREATE TABLE IF NOT EXISTS creator_profile_refreshes (
 id TEXT PRIMARY KEY, cluster_id TEXT NOT NULL, token_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'collecting', accounts JSONB NOT NULL, steps JSONB NOT NULL,
 baseline_profile JSONB NOT NULL, intelligence_id TEXT, oldest_source_at TIMESTAMP(3),
 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at TIMESTAMP(3) NOT NULL,
 completed_at TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS creator_profile_refreshes_cluster_id_created_at_idx
 ON creator_profile_refreshes(cluster_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS creator_profile_refresh_one_active
 ON creator_profile_refreshes(cluster_id) WHERE status IN ('collecting', 'analyzing');
