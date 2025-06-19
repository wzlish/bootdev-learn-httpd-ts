import Express from "express";
import { BadRequestError } from "./error_handler.js";
import { createUser } from "./db/queries/users.js";

export async function handlerUserCreate(
  req: Express.Request,
  res: Express.Response,
) {
  if (!req.body) {
    throw new BadRequestError("Missing or invalid JSON body");
  }

  type parameters = {
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email.length || params.email.length == 0) {
    throw new BadRequestError(`You must provide a registration email address.`);
  }

  const results = await createUser({ email: params.email });

  if (!results) {
    throw new Error("Could not create user.");
  }

  res.status(201).send(JSON.stringify(results));
}
