import type { MigrationConfig } from "drizzle-orm/migrator";
import { hashPassword } from "./auth.js";
import crypto from "crypto";

process.loadEnvFile();

function getENV(key: string) {
  if (!Object.hasOwn(process.env, key) || !process.env[key]) {
    throw new Error(`${key} not found or set in .env`);
  }

  return process.env[key];
}

type Config = {
  api: ApiConfig;
  db: DBConfig;
  jwt: JWTConfig;
  polka: PolkaConfig;
};

type JWTConfig = {
  secret: string;
  defaultDur: number;
  refreshDur: number;
};

type ApiConfig = {
  fileserverHits: number;
  messageLengthLimit: number;
  platform: string;
};

type DBConfig = {
  db_url: string;
  migration_cfg: MigrationConfig;
  bcrypt_cost: number;
  bcrypt_dummy: string;
};

type PolkaConfig = {
  key: string;
};

export const config: Config = {
  api: {
    messageLengthLimit: 140,
    fileserverHits: 0,
    platform: getENV("PLATFORM"),
  },
  db: {
    db_url: getENV("DB_URL"),
    migration_cfg: { migrationsFolder: "src/db/" },
    bcrypt_cost: 11,
    bcrypt_dummy:
      "$2b$11$S.f1JfWW1VmBEZeDCCm8ruoTh.rP//b8pc4SYANQBKRvkBFO7MP0y",
  },
  jwt: {
    secret: getENV("JWT_SECRET"),
    defaultDur: 3600, // Seconds
    refreshDur: 60, // Days
  },
  polka: {
    key: getENV("POLKA_KEY"),
  },
};

const dummyHash = await hashPassword(
  crypto.randomBytes(32).toString("base64"),
  config.db.bcrypt_cost,
);
config.db.bcrypt_dummy = dummyHash;
