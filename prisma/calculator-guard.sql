CREATE TABLE IF NOT EXISTS calculator_guard_counter (
  bucket text PRIMARY KEY,
  used integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS calculator_guard_job (
  job_key text PRIMARY KEY,
  token text NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS calculator_guard_counter_expiry ON calculator_guard_counter(expires_at);
CREATE INDEX IF NOT EXISTS calculator_guard_job_expiry ON calculator_guard_job(expires_at);
