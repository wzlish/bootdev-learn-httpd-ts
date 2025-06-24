import { eq, gt, and, sql, isNull } from "drizzle-orm";
import { db } from "../index.js";
import {
  NewUser,
  users,
  NewRefreshToken,
  refreshTokens,
  UpdateUser,
} from "../schema.js";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function clearUsers() {
  await db.delete(users);
}

export async function getUser(email: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result;
}

export async function newRefreshToken(token: NewRefreshToken) {
  const [result] = await db
    .insert(refreshTokens)
    .values(token)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.id, token),
        gt(refreshTokens.expiresAt, sql`NOW()`),
        isNull(refreshTokens.revokedAt),
      ),
    )
    .limit(1);
  return result;
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: sql`NOW()` })
    .where(eq(refreshTokens.id, token));
}

export async function updateUser(uuid: string, user: UpdateUser) {
  const [result] = await db
    .update(users)
    .set(user)
    .where(eq(users.id, uuid))
    .returning();
  return result;
}
