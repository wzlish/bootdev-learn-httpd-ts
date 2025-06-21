import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function clearChirps() {
  await db.delete(chirps);
}

export async function getChirps() {
  const results = await db.select().from(chirps).orderBy(chirps.createdAt);
  return results;
}

export async function getChirp(id: string) {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id))
    .limit(1);
  return result;
}
