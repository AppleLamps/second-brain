import postgres from "postgres";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

let _sql: postgres.Sql | null = null;

export function db() {
  if (_sql) return _sql;

  // Neon pooler URLs work well with postgres.js in serverless.
  const url = requireEnv("DATABASE_URL");
  _sql = postgres(url, {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return _sql;
}

