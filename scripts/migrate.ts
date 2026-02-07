import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { db } from "../src/lib/db";

async function main() {
  const sql = db();
  const file = resolve(process.cwd(), "src/lib/migrations/001_init.sql");
  const ddl = await readFile(file, "utf-8");

  await sql.begin(async (tx) => {
    // Split on semicolons conservatively. The migration is simple DDL.
    const statements = ddl
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await tx.unsafe(stmt);
    }
  });

  console.log("ok: migrated");
  await sql.end({ timeout: 5 });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
