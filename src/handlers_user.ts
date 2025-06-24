import Express from "express";
import { BadRequestError, DatabaseError } from "./handlers_error.js";
import { createUser, updateUser } from "./db/queries/users.js";
import { config } from "./config.js";
import { selectFields } from "./util.js";
import { hashPassword, getBearerToken, validateJWT } from "./auth.js";

type UserDataResponse = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
};
const userResponseKeys: (keyof UserDataResponse)[] = [
  "id",
  "createdAt",
  "updatedAt",
  "email",
];

export async function handlerUserCreate(
  req: Express.Request,
  res: Express.Response,
) {
  if (!req.body) {
    throw new BadRequestError("Missing or invalid JSON body");
  }

  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError(`You must provide a registration email address.`);
  }

  if (!params.password) {
    throw new BadRequestError(`You must provide a password.`);
  }
  const hashedPassword = await hashPassword(
    params.password,
    config.db.bcrypt_cost,
  );
  const results = await createUser({
    email: params.email,
    hashedPassword: hashedPassword,
  });

  if (!results) {
    throw new DatabaseError("Could not create user.");
  }

  res.status(201).send(selectFields(results, userResponseKeys));
}

export async function handlerUserUpdate(
  req: Express.Request,
  res: Express.Response,
) {
  const tokenUser = validateJWT(getBearerToken(req), config.jwt.secret);

  if (!req.body) {
    throw new BadRequestError("Missing or invalid JSON body");
  }

  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Update requires both email & password.");
  }

  const passwordHash = await hashPassword(password, config.db.bcrypt_cost);

  const result = await updateUser(tokenUser, {
    email: email,
    hashedPassword: passwordHash,
  });

  if (!result) {
    throw new DatabaseError("Unable to update user profile");
  }

  res.status(200).send(selectFields(result, userResponseKeys));
}
