import bcrypt from "bcrypt";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { BadRequestError, ForbiddenError } from "./handlers_error.js";
import Express from "express";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(
  password: string,
  bcryptCost: number,
): Promise<string> {
  try {
    return await bcrypt.hash(password, bcryptCost);
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

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): string {
  const iat = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: "chirpy",
      sub: userID,
      iat: iat,
      exp: iat + expiresIn,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );
}

export function validateJWT(tokenString: string, secret: string) {
  try {
    const decoded: payload = jwt.verify(tokenString, secret) as JwtPayload;
    if (!decoded.sub) {
      throw new ForbiddenError("No userid in token.");
    }
    if (!decoded.iss || decoded.iss !== "chirpy") {
      throw new ForbiddenError("Invalid Issuer.");
    }
    return decoded.sub;
  } catch (err) {
    throw new ForbiddenError("Invalid Token.");
  }
}

export function getBearerToken(req: Express.Request): string {
  const authHeader = req.header("Authorization")?.trim().split(" ");
  if (!authHeader || authHeader.length <= 1 || authHeader[0] !== "Bearer") {
    throw new BadRequestError("Invalid authorization header.");
  }
  return authHeader[authHeader.length - 1];
}
