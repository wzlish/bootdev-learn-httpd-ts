process.loadEnvFile();
import { defineConfig } from "drizzle-kit";
const key = "DB_URL";
if (!Object.hasOwn(process.env, key) || !process.env[key]) {
  throw new Error(`${key} not found or set in .env`);
}

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "src/db/",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env[key],
  },
});
