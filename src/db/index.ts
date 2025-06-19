import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";
import { apiConfig } from "../config.js";

const conn = postgres(apiConfig.db_url);
export const db = drizzle(conn, { schema });
