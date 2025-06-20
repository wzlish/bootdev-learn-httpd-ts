import Express from "express";
import { BadRequestError } from "./handlers_error.js";
import { createUser } from "./db/queries/users.js";
import { createChirp, getChirps } from "./db/queries/chirps.js";
import { config } from "./config.js";

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

  if (!params.email.length) {
    throw new BadRequestError(`You must provide a registration email address.`);
  }

  const results = await createUser({ email: params.email });

  if (!results) {
    throw new Error("Could not create user.");
  }

  res.status(201).send(JSON.stringify(results));
}

export async function handlerNewChirp(
  req: Express.Request,
  res: Express.Response,
) {
  const badWords = ["kerfuffle", "sharbert", "fornax"];
  if (!req.body) {
    throw new BadRequestError("Missing or invalid JSON body");
  }

  type parameters = {
    body: string;
    userId: string;
  };
  const params: parameters = req.body;

  if (!params.userId) {
    throw new BadRequestError("Missing or invalid userId");
  }

  if (params.body.length > config.api.messageLengthLimit) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${config.api.messageLengthLimit}`,
    );
  }
  const cleanChirp: string[] = [];
  params.body.split(" ").forEach((word: string) => {
    if (badWords.includes(word.toLowerCase())) {
      cleanChirp.push("****");
      return;
    }
    cleanChirp.push(word);
  });

  const results = await createChirp({
    body: cleanChirp.join(" "),
    userId: params.userId,
  });
  if (!results) {
    throw new Error("Could not create chirp.");
  }

  res.status(201).send(JSON.stringify(results));
}

export async function handlerGetChirps(
  _: Express.Request,
  res: Express.Response,
) {
  const results = await getChirps();
  res.status(200).send(JSON.stringify(results));
}
