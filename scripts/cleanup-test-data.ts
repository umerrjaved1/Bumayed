/**
 * Launch cleanup: real admin first, then remove dev accounts' access and all
 * test data. Built to be safe on a live database:
 *
 *  - Does NOTHING unless --apply is given (default is a dry run that only
 *    prints counts).
 *  - Stage A takes a full JSON backup and promotes the real admin. No deletions.
 *  - Stage B (blocks dev accounts, deletes test data) refuses to run unless a
 *    fresh backup exists and the real admin is already a Super Admin. All of
 *    it runs in ONE transaction with checks at the end; any surprise rolls
 *    everything back.
 *  - --restore puts the backed-up rows back.
 *
 * Usage (DATABASE_URL points at the database to change):
 *   npx tsx scripts/cleanup-test-data.ts --stage=a --admin-email=you@example.com [--apply]
 *   npx tsx scripts/cleanup-test-data.ts --stage=b --admin-email=you@example.com --backup-dir=<dir> [--apply]
 *   npx tsx scripts/cleanup-test-data.ts --restore=<backup dir> [--apply]
 */
import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Pool, type PoolClient } from "pg";

const args = process.argv.slice(2);
const opt = (name: string) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const APPLY = args.includes("--apply");

const DEV_EMAIL = "%@bumayed.local";

/** Tables to back up, in an order that is safe to restore (parents first). */
const BACKUP_TABLES = [
  "users",
  "user_profiles",
  "dealer_profiles",
  "payments",
  "transactions",
  "listings",
  "listing_images",
  "listing_videos",
  "featured_promotions",
  "subscriptions",
  "favorites",
  "reports",
  "notifications",
  "admin_activity_logs",
] as const;

/** The tables Stage B deletes from (and so --restore re-inserts into). */
const RESTORE_TABLES = [
  "payments",
  "transactions",
  "listings",
  "listing_images",
  "listing_videos",
  "featured_promotions",
  "subscriptions",
  "favorites",
  "reports",
  "notifications",
] as const;

function mask(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.slice(0, 3)}…@${domain}`;
}

async function count(db: PoolClient | Pool, sql: string, params: unknown[] = []) {
  return Number((await db.query(sql, params)).rows[0].c);
}

async function snapshot(db: PoolClient | Pool) {
  return {
    listings: await count(db, `select count(*) c from listings`),
    images: await count(db, `select count(*) c from listing_images`),
    payments: await count(db, `select count(*) c from payments`),
    subscriptions: await count(db, `select count(*) c from subscriptions`),
    notificationsOfDevUsers: await count(
      db,
      `select count(*) c from notifications where "userId" in (select id from users where email like $1)`,
      [DEV_EMAIL],
    ),
    devUsers: await count(db, `select count(*) c from users where email like $1`, [DEV_EMAIL]),
    realUsers: await count(
      db,
      `select count(*) c from users where email is null or email not like $1`,
      [DEV_EMAIL],
    ),
    activeSuperAdmins: await count(
      db,
      `select count(*) c from users where role = 'SUPER_ADMIN' and status = 'ACTIVE'`,
    ),
  };
}

/* ------------------------------ backup ------------------------------ */

async function takeBackup(db: Pool, dir: string) {
  mkdirSync(dir, { recursive: true });
  const manifest: Record<string, number> = {};
  for (const table of BACKUP_TABLES) {
    const rows = (await db.query(`select to_jsonb(t) as r from "${table}" t`)).rows.map(
      (x) => x.r,
    );
    writeFileSync(join(dir, `${table}.json`), JSON.stringify(rows));
    manifest[table] = rows.length;
  }
  // Prove the files match the database before anything is changed.
  for (const table of BACKUP_TABLES) {
    const inDb = await count(db, `select count(*) c from "${table}"`);
    if (inDb !== manifest[table]) {
      throw new Error(`Backup mismatch for ${table}: file has ${manifest[table]}, database has ${inDb}`);
    }
  }
  writeFileSync(
    join(dir, "manifest.json"),
    JSON.stringify({ takenAt: new Date().toISOString(), tables: manifest }, null, 2),
  );
  return manifest;
}

function readManifest(dir: string) {
  const file = join(dir, "manifest.json");
  if (!existsSync(file)) throw new Error(`No backup found in ${dir}`);
  return JSON.parse(readFileSync(file, "utf8")) as {
    takenAt: string;
    tables: Record<string, number>;
  };
}

/* ------------------------------ stage A ------------------------------ */

async function stageA(db: Pool, adminEmail: string) {
  const user = (
    await db.query(`select id, email, role, status from users where lower(email) = lower($1)`, [adminEmail])
  ).rows;
  if (user.length !== 1) throw new Error(`Expected exactly one account for ${mask(adminEmail)}, found ${user.length}`);
  const u = user[0];
  if (u.email.toLowerCase().endsWith("@bumayed.local")) throw new Error("The new admin must not be a dev account");

  console.log(`\nStage A: backup + make ${mask(u.email)} a Super Admin`);
  console.log(`  that account is currently: role ${u.role}, status ${u.status}`);
  const before = await snapshot(db);
  console.log("  database now:", before);

  if (!APPLY) {
    console.log("\nDRY RUN: nothing changed. Re-run with --apply to take the backup and promote.");
    return;
  }

  const dir = resolve(
    opt("backup-dir") ?? join(process.cwd(), "..", "bumayed-backups", new Date().toISOString().replace(/[:.]/g, "-")),
  );
  const manifest = await takeBackup(db, dir);
  console.log(`  backup written to ${dir}`);
  console.log("  backup rows:", manifest);

  const client = await db.connect();
  try {
    await client.query("begin");
    await client.query(`update users set role = 'SUPER_ADMIN', status = 'ACTIVE', "updatedAt" = now() where id = $1`, [u.id]);
    await client.query(
      `insert into admin_activity_logs (id, "actorId", action, "targetType", "targetId", metadata)
       values (gen_random_uuid(), $1::uuid, 'user.role_change', 'User', $1::text, $2::jsonb)`,
      [u.id, JSON.stringify({ from: u.role, to: "SUPER_ADMIN", note: "launch cleanup bootstrap" })],
    );
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
  console.log(`\nDone. ${mask(u.email)} is now a Super Admin.`);
  console.log(`Backup folder (needed for Stage B): ${dir}`);
}

/* ------------------------------ stage B ------------------------------ */

async function stageB(db: Pool, adminEmail: string) {
  const backupDir = opt("backup-dir");
  if (!backupDir) throw new Error("Stage B needs --backup-dir=<folder from Stage A>");
  const manifest = readManifest(resolve(backupDir));
  const ageHours = (Date.now() - new Date(manifest.takenAt).getTime()) / 3_600_000;
  if (ageHours > 24) throw new Error(`Backup is ${ageHours.toFixed(1)} hours old; take a fresh one with Stage A`);

  const admin = (
    await db.query(`select id, email, role, status from users where lower(email) = lower($1)`, [adminEmail])
  ).rows[0];
  if (!admin || admin.role !== "SUPER_ADMIN" || admin.status !== "ACTIVE") {
    throw new Error("The real admin is not an active Super Admin yet: run Stage A first and confirm sign-in.");
  }

  // Everything financial must belong to dev accounts, or we stop and ask.
  const foreignPayments = await count(
    db,
    `select count(*) c from payments where "userId" not in (select id from users where email like $1)`,
    [DEV_EMAIL],
  );
  const foreignSubs = await count(
    db,
    `select count(*) c from subscriptions where "dealerId" not in (select id from users where email like $1)`,
    [DEV_EMAIL],
  );
  if (foreignPayments || foreignSubs) {
    throw new Error(`Found ${foreignPayments} payments and ${foreignSubs} subscriptions of real accounts: refusing to delete.`);
  }

  console.log(`\nStage B: block dev accounts and delete test data (admin: ${mask(admin.email)})`);
  console.log(`  using backup taken ${manifest.takenAt}:`, manifest.tables);
  const before = await snapshot(db);
  console.log("  database now:", before);
  console.log(
    `  will: block ${before.devUsers} dev accounts, delete ${before.listings} listings (+${before.images} photos), ` +
      `${before.payments} payments, ${before.subscriptions} subscriptions, ${before.notificationsOfDevUsers} notifications`,
  );

  if (!APPLY) {
    console.log("\nDRY RUN: nothing changed. Re-run with --apply to do it.");
    return;
  }

  const client = await db.connect();
  try {
    await client.query("begin");
    await client.query(
      `update users set status = 'BLOCKED', "passwordHash" = null, "updatedAt" = now() where email like $1`,
      [DEV_EMAIL],
    );
    await client.query(
      `delete from subscriptions where "dealerId" in (select id from users where email like $1)`,
      [DEV_EMAIL],
    );
    // Photos, videos, promotions, favorites and reports go with their listing.
    await client.query(`delete from listings`);
    await client.query(`delete from payments where "userId" in (select id from users where email like $1)`, [DEV_EMAIL]);
    await client.query(`delete from notifications where "userId" in (select id from users where email like $1)`, [DEV_EMAIL]);

    // Checks: any surprise rolls everything back.
    const after = await snapshot(client);
    const problems: string[] = [];
    if (after.listings || after.images) problems.push("listings or photos remain");
    if (after.payments || after.subscriptions) problems.push("payments or subscriptions remain");
    if (after.notificationsOfDevUsers) problems.push("dev notifications remain");
    if (after.realUsers !== before.realUsers) problems.push("the number of real accounts changed");
    if (after.activeSuperAdmins !== 1) problems.push(`expected exactly 1 active Super Admin, found ${after.activeSuperAdmins}`);
    const stillOpen = await count(
      client,
      `select count(*) c from users where email like $1 and (status <> 'BLOCKED' or "passwordHash" is not null)`,
      [DEV_EMAIL],
    );
    if (stillOpen) problems.push("a dev account can still sign in");
    if (problems.length) throw new Error(`Safety check failed, rolled back: ${problems.join("; ")}`);

    await client.query("commit");
    console.log("\nDone. Database now:", after);
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

/* ------------------------------ restore ------------------------------ */

async function restore(db: Pool, dir: string) {
  const root = resolve(dir);
  const manifest = readManifest(root);
  console.log(`\nRestore from backup taken ${manifest.takenAt}`);
  console.log("  rows in backup:", manifest.tables);
  if (!APPLY) {
    console.log("\nDRY RUN: nothing changed. Re-run with --apply to restore.");
    return;
  }
  const client = await db.connect();
  try {
    await client.query("begin");
    // Dev accounts get their old role, status and password hash back.
    const users: Array<Record<string, unknown>> = JSON.parse(readFileSync(join(root, "users.json"), "utf8"));
    for (const u of users) {
      await client.query(
        `update users set role = $2::"Role", status = $3::"UserStatus", "passwordHash" = $4 where id = $1`,
        [u.id, u.role, u.status, u.passwordHash],
      );
    }
    // Re-insert deleted rows, parents before children. Existing rows are left alone.
    for (const table of RESTORE_TABLES) {
      const rows = readFileSync(join(root, `${table}.json`), "utf8");
      const res = await client.query(
        `insert into "${table}" select * from jsonb_populate_recordset(null::"${table}", $1::jsonb) on conflict do nothing`,
        [rows],
      );
      console.log(`  ${table}: restored ${res.rowCount} rows`);
    }
    await client.query("commit");
    console.log("\nRestore complete.");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

/* ------------------------------- main -------------------------------- */

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const host = new URL(url).hostname;
  console.log(`Database host: ${host}  |  mode: ${APPLY ? "APPLY (will change data)" : "dry run"}`);

  const db = new Pool({ connectionString: url, max: 2 });
  try {
    const restoreDir = opt("restore");
    if (restoreDir) return await restore(db, restoreDir);

    const adminEmail = opt("admin-email");
    if (!adminEmail) throw new Error("--admin-email=<real admin account> is required");
    const stage = opt("stage");
    if (stage === "a") return await stageA(db, adminEmail);
    if (stage === "b") return await stageB(db, adminEmail);
    throw new Error("Use --stage=a, --stage=b or --restore=<dir>");
  } finally {
    await db.end();
  }
}

main().catch((e) => {
  console.error("\nSTOPPED:", e instanceof Error ? e.message : e);
  process.exit(1);
});
