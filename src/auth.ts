import bcrypt from "bcrypt";
import { config } from "./config.js";

export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, config.db.bcrypt_cost);
  } catch (err) {
    throw new Error(
      "Error hashing password: " +
        (err instanceof Error ? err.message : String(err)),
    );
  }
}

export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    throw new Error(
      "Error comparing password: " +
        (err instanceof Error ? err.message : String(err)),
    );
  }
}
