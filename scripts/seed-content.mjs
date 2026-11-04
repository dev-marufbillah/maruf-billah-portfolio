#!/usr/bin/env node
/**
 * Migration / seed script.
 *
 * Moves existing content (content/portfolio.json, an exported Content Studio
 * JSON, or a previous localStorage export) into MongoDB as per-section
 * documents. It NEVER overwrites an existing section unless --force is given,
 * and it never writes defaults into an empty database: an empty DB means the
 * public site shows the built-in defaults (see src/lib/default-content.ts).
 *
 * Usage:
 *   node scripts/seed-content.mjs
 *   node scripts/seed-content.mjs --file ./my-export.json
 *   node scripts/seed-content.mjs --force
 *   node scripts/seed-content.mjs --dry-run
 */
import fs from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const SECTION_KEYS = [
  "homepage", "personal", "socialLinks", "heroSocialIds", "contactSocialIds",
  "navigation", "skillCategories", "educationEntries", "educationPlaceholder",
  "educationSection", "experienceEntries", "developmentJourney", "achievements",
  "achievementsSection", "services", "servicesSection", "projects",
  "projectsSection", "appearance", "seo",
];

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return {
    file: get("--file") || path.join(process.cwd(), "content", "portfolio.json"),
    force: args.includes("--force"),
    dryRun: args.includes("--dry-run"),
    reset: args.includes("--reset"),
  };
}

async function loadEnvLocal() {
  // Minimal .env.local reader (no extra dependency).
  const file = path.join(process.cwd(), ".env.local");
  try {
    const text = await fs.readFile(file, "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      if (process.env[match[1]]) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  } catch {
    // .env.local is optional; Vercel injects env directly.
  }
}

async function main() {
  await loadEnvLocal();
  const { file, force, dryRun, reset } = parseArgs();
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(path.resolve(file), "utf8"));
  } catch (error) {
    console.error(`Could not read ${file}:`, error.message);
    process.exit(1);
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    console.error("The JSON file must contain a content object.");
    process.exit(1);
  }

  const entries = SECTION_KEYS.filter((key) => Object.prototype.hasOwnProperty.call(raw, key));
  if (entries.length === 0) {
    console.log(`No section data found in ${file}. Database stays empty, so the site shows defaults. Nothing was lost.`);
    return;
  }

  console.log(`Source: ${file}`);
  console.log(`Sections to migrate: ${entries.join(", ")}`);
  if (dryRun) {
    console.log("Dry run — nothing written.");
    return;
  }

  const uri = (process.env.MONGODB_URI || "").trim();
  if (!uri) {
    console.error("MONGODB_URI is missing. Add it to .env.local or Vercel Environment Variables.");
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  const db = client.db((process.env.MONGODB_DB || "").trim() || undefined);
  try {
    for (const key of entries) {
      const collection = db.collection(`section_${key}`);
      const existing = await collection.findOne({ _id: key });
      if (existing && !force && !reset) {
        console.log(`  skip  ${key} (already in database; use --force to overwrite)`);
        continue;
      }
      await collection.updateOne(
        { _id: key },
        {
          $set: { data: raw[key], updatedAt: new Date() },
          $inc: { version: 1 },
          $setOnInsert: { _id: key },
        },
        { upsert: true },
      );
      console.log(`  saved ${key}`);
    }
    console.log("Migration complete. Public site, admin and mobile now read the same MongoDB data.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
