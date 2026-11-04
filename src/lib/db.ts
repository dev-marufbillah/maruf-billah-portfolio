import mongoose from "mongoose";
import { MongoClient, type Db } from "mongodb";

/**
 * Serverless-optimised MongoDB connection cache.
 * One connection per warm lambda / hot-reload, never one per request.
 */
interface DbCache {
  mongooseConn: typeof mongoose | null;
  mongoosePromise: Promise<typeof mongoose> | null;
  client: MongoClient | null;
  db: Db | null;
}

interface DevMemory {
  auth?: Record<string, unknown[]>;
}

const globalRef = globalThis as unknown as {
  __marufDbCache?: DbCache;
  __marufDevMemory?: DevMemory;
};

export const dbCache: DbCache = (globalRef.__marufDbCache ??= {
  mongooseConn: null,
  mongoosePromise: null,
  client: null,
  db: null,
});

export function mongoUri() {
  return (process.env.MONGODB_URI || "").trim();
}

export function mongoDbName() {
  return (process.env.MONGODB_DB || "").trim() || undefined;
}

export function isVercelRuntime() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

export function isDatabaseConfigured() {
  return mongoUri().length > 0;
}

/**
 * Local-only fallback used when MONGODB_URI is absent (so the whole flow can be
 * exercised before Atlas credentials exist). NEVER active on Vercel.
 */
export function isDevFallback() {
  return !isDatabaseConfigured() && !isVercelRuntime();
}

/** Memory adapter needs every model table pre-created. */
const DEV_AUTH_MODELS = [
  "user", "session", "account", "verification", "rateLimit", "jwks",
  "organization", "member", "invitation", "team", "passkey", "twoFactor",
] as const;

export function devMemory(): DevMemory {
  const store = (globalRef.__marufDevMemory ??= {});
  if (!store.auth) store.auth = {};
  for (const model of DEV_AUTH_MODELS) {
    if (!Array.isArray(store.auth[model])) store.auth[model] = [];
  }
  return store;
}

export async function connectMongoose() {
  const uri = mongoUri();
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (dbCache.mongooseConn?.connection.readyState === 1) return dbCache.mongooseConn;
  if (!dbCache.mongoosePromise) {
    dbCache.mongoosePromise = mongoose.connect(uri, {
      dbName: mongoDbName(),
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8_000,
      retryWrites: true,
    });
  }
  try {
    dbCache.mongooseConn = await dbCache.mongoosePromise;
  } catch (error) {
    dbCache.mongoosePromise = null;
    throw error;
  }
  return dbCache.mongooseConn;
}

/** Synchronous native driver handle for the Better Auth MongoDB adapter. */
export function getNativeDb(): Db {
  if (!dbCache.db) {
    const uri = mongoUri();
    if (!uri) throw new Error("MONGODB_URI is not configured.");
    dbCache.client = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8_000,
    });
    dbCache.db = dbCache.client.db(mongoDbName());
  }
  return dbCache.db;
}

export function getNativeClient(): MongoClient {
  getNativeDb();
  return dbCache.client as MongoClient;
}
