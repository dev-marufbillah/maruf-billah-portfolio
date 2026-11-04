import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import mongoose, { Schema } from "mongoose";
import { connectMongoose, isDatabaseConfigured, isDevFallback, isVercelRuntime } from "@/lib/db";

/** Cloudinary URL + public_id are stored in the database, never only in a browser. */
export interface AssetRecord {
  key: string;
  url: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  updatedAt: string;
}

const assetSchema = new Schema(
  {
    _id: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, default: "image" },
    bytes: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

type LooseModel = mongoose.Model<{ _id: string; url: string; publicId: string; resourceType: string; bytes: number; updatedAt: Date }>;

function assetModel(): LooseModel {
  const name = "PortfolioAsset";
  return (mongoose.models[name] as unknown as LooseModel | undefined) ?? (mongoose.model(name, assetSchema, "portfolio_assets") as unknown as LooseModel);
}

const DEV_FILE = path.join(process.cwd(), "content", "assets.dev.json");

function mode() {
  if (isDevFallback()) return "dev-file" as const;
  if (!isDatabaseConfigured() && isVercelRuntime()) return "unconfigured" as const;
  return "mongodb" as const;
}

async function readDev(): Promise<Record<string, AssetRecord>> {
  try {
    return JSON.parse(await readFile(DEV_FILE, "utf8")) as Record<string, AssetRecord>;
  } catch {
    return {};
  }
}

export async function getAsset(key: string): Promise<AssetRecord | null> {
  if (mode() === "unconfigured") throw new Error("MONGODB_URI is not configured on this deployment.");
  if (mode() === "dev-file") return (await readDev())[key] ?? null;
  await connectMongoose();
  const doc = await assetModel().findById(key).lean().exec();
  if (!doc) return null;
  return {
    key: doc._id,
    url: doc.url,
    publicId: doc.publicId,
    resourceType: doc.resourceType,
    bytes: doc.bytes,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

export async function putAsset(record: AssetRecord): Promise<void> {
  if (mode() === "unconfigured") throw new Error("MONGODB_URI is not configured on this deployment.");
  if (mode() === "dev-file") {
    const all = await readDev();
    all[record.key] = record;
    await mkdir(path.dirname(DEV_FILE), { recursive: true });
    await writeFile(DEV_FILE, JSON.stringify(all, null, 2), "utf8");
    return;
  }
  await connectMongoose();
  await assetModel().updateOne(
    { _id: record.key },
    {
      $set: {
        url: record.url,
        publicId: record.publicId,
        resourceType: record.resourceType,
        bytes: record.bytes,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  ).exec();
}

export async function deleteAssetRecord(key: string): Promise<void> {
  if (mode() === "unconfigured") throw new Error("MONGODB_URI is not configured on this deployment.");
  if (mode() === "dev-file") {
    const all = await readDev();
    delete all[key];
    await mkdir(path.dirname(DEV_FILE), { recursive: true });
    await writeFile(DEV_FILE, JSON.stringify(all, null, 2), "utf8");
    return;
  }
  await connectMongoose();
  await assetModel().deleteOne({ _id: key }).exec();
}
