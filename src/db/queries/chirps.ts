import { eq, and } from "drizzle-orm";
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

export async function getChirps(authorId: string) {
  let results;
  if (authorId) {
    results = await db
      .select()
      .from(chirps)
      .where(eq(chirps.userId, authorId))
      .orderBy(chirps.createdAt);
  } else {
    results = await db.select().from(chirps).orderBy(chirps.createdAt);
  }
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

export async function deleteChirp(id: string, userid: string) {
  const [result] = await db
    .delete(chirps)
    .where(and(eq(chirps.id, id), eq(chirps.userId, userid)))
    .returning();
  return result;
}
