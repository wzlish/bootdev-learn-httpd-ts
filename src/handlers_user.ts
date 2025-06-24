import Express from "express";
import { BadRequestError } from "./handlers_error.js";
import { createUser } from "./db/queries/users.js";
import { config } from "./config.js";
import { selectFields } from "./util.js";
import { hashPassword } from "./auth.js";

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
    throw new Error("Could not create user.");
  }

  res.status(201).send(selectFields(results, userResponseKeys));
}
