import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import mongoose, { Schema } from "mongoose";
import { connectMongoose, isDatabaseConfigured, isDevFallback, isVercelRuntime } from "@/lib/db";

import { isSectionKey, SECTION_KEYS, type SectionKey } from "@/lib/section-keys";

export { isSectionKey, SECTION_KEYS, type SectionKey };

export interface SectionRecord {
  key: SectionKey;
  data: unknown;
  updatedAt: string;
  version: number;
}

const sectionSchema = new Schema(
  {
    _id: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, default: 1 },
    updatedAt: { type: Date, default: Date.now },
  },
  { strict: false, minimize: false, versionKey: false },
);

type LooseModel = mongoose.Model<{ _id: string; data: unknown; version: number; updatedAt: Date }>;
const modelCache = new Map<SectionKey, LooseModel>();

function sectionModel(key: SectionKey): LooseModel {
  const cached = modelCache.get(key);
  if (cached) return cached;
  const name = `PortfolioSection_${key}`;
  const instance = (mongoose.models[name] as unknown as LooseModel | undefined) ?? (mongoose.model(name, sectionSchema, `section_${key}`) as unknown as LooseModel);
  modelCache.set(key, instance);
  return instance;
}

const DEV_FILE = path.join(process.cwd(), "content", "sections.dev.json");

async function readDev(): Promise<Record<string, SectionRecord>> {
  try {
    return JSON.parse(await readFile(DEV_FILE, "utf8")) as Record<string, SectionRecord>;
  } catch {
    return {};
  }
}

async function writeDev(next: Record<string, SectionRecord>) {
  await mkdir(path.dirname(DEV_FILE), { recursive: true });
  await writeFile(DEV_FILE, JSON.stringify(next, null, 2), "utf8");
}

export function storageMode() {
  if (isDevFallback()) return "dev-file" as const;
  if (!isDatabaseConfigured() && isVercelRuntime()) return "unconfigured" as const;
  return "mongodb" as const;
}

/** Returns null when the database has never been seeded (caller shows defaults). */
export async function readAllSections(): Promise<{
  sections: Partial<Record<SectionKey, unknown>>;
  records: Record<string, SectionRecord>;
  hasData: boolean;
  mode: ReturnType<typeof storageMode>;
}> {
  const mode = storageMode();
  if (mode === "unconfigured") throw new Error("MONGODB_URI is not configured on this deployment.");
  if (mode === "dev-file") {
    const records = await readDev();
    const sections: Partial<Record<SectionKey, unknown>> = {};
    for (const key of SECTION_KEYS) if (records[key]) sections[key] = records[key].data;
    return { sections, records, hasData: Object.keys(records).length > 0, mode };
  }

  await connectMongoose();
  const docs = await Promise.all(
    SECTION_KEYS.map((key) => sectionModel(key).findById(key).lean().exec()),
  );
  const sections: Partial<Record<SectionKey, unknown>> = {};
  const records: Record<string, SectionRecord> = {};
  SECTION_KEYS.forEach((key, index) => {
    const doc = docs[index];
    if (doc) {
      sections[key] = doc.data;
      records[key] = {
        key,
        data: doc.data,
        version: doc.version ?? 1,
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
      };
    }
  });
  return { sections, records, hasData: Object.keys(records).length > 0, mode };
}

export async function writeSections(
  entries: Record<string, unknown>,
): Promise<{ saved: SectionKey[]; records: Record<string, SectionRecord> }> {
  const keys = Object.keys(entries).filter(isSectionKey);
  if (keys.length === 0) throw new Error("No valid section keys were provided.");

  const mode = storageMode();
  if (mode === "unconfigured") throw new Error("MONGODB_URI is not configured on this deployment.");

  if (mode === "dev-file") {
    const existing = await readDev();
    for (const key of keys) {
      existing[key] = {
        key,
        data: entries[key],
        version: (existing[key]?.version ?? 0) + 1,
        updatedAt: new Date().toISOString(),
      };
    }
    await writeDev(existing);
    return { saved: keys, records: existing };
  }

  await connectMongoose();
  await Promise.all(
    keys.map((key) =>
      sectionModel(key).updateOne(
        { _id: key },
        { $set: { data: entries[key], updatedAt: new Date() }, $inc: { version: 1 } },
        { upsert: true },
      ).exec(),
    ),
  );
  const { records } = await readAllSections();
  return { saved: keys, records };
}

export async function deleteSection(key: SectionKey): Promise<void> {
  const mode = storageMode();
  if (mode === "unconfigured") throw new Error("MONGODB_URI is not configured on this deployment.");
  if (mode === "dev-file") {
    const existing = await readDev();
    delete existing[key];
    await writeDev(existing);
    return;
  }
  await connectMongoose();
  await sectionModel(key).deleteOne({ _id: key }).exec();
}
