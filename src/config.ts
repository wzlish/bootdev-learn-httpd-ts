import type { MigrationConfig } from "drizzle-orm/migrator";
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
};

type ApiConfig = {
  fileserverHits: number;
  messageLengthLimit: number;
};

type DBConfig = {
  db_url: string;
  migration_cfg: MigrationConfig;
};

export const config: Config = {
  api: { messageLengthLimit: 140, fileserverHits: 0 },
  db: {
    db_url: getENV("DB_URL"),
    migration_cfg: { migrationsFolder: "src/db/" },
  },
};
