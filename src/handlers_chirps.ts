import Express from "express";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./handlers_error.js";

import {
  createChirp,
  getChirps,
  getChirp,
  deleteChirp,
} from "./db/queries/chirps.js";
import { config } from "./config.js";
import { isValidUuid } from "./util.js";
import { validateJWT, getBearerToken } from "./auth.js";

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
  };
  const params: parameters = req.body;
  const tokenUser = validateJWT(getBearerToken(req), config.jwt.secret);
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
    userId: tokenUser,
  });
  if (!results) {
    throw new Error("Could not create chirp.");
  }

  res.status(201).send(results);
}

export async function handlerGetChirps(
  _: Express.Request,
  res: Express.Response,
) {
  const results = await getChirps();
  res.status(200).send(results);
}

export async function handlerGetChirp(
  req: Express.Request,
  res: Express.Response,
) {
  const chirpID = req.params.id;
  if (!chirpID || !isValidUuid(chirpID)) {
    throw new BadRequestError("Invalid chirp id.");
  }

  const result = await getChirp(chirpID);
  if (!result) {
    throw new NotFoundError("No chirp with that id found.");
  }
  res.status(200).send(result);
}

export async function handlerDeleteChirp(
  req: Express.Request,
  res: Express.Response,
) {
  const chirpID = req.params.id;
  if (!chirpID || !isValidUuid(chirpID)) {
    throw new BadRequestError("Invalid chirp id.");
  }

  const chirp = await getChirp(chirpID);
  if (!chirp) {
    throw new NotFoundError("BBB No chirp with that id found.");
  }
  const tokenUser = validateJWT(getBearerToken(req), config.jwt.secret);
  if (chirp.userId !== tokenUser) {
    throw new ForbiddenError("Not your chirp!");
  }

  const result = await deleteChirp(chirpID, tokenUser);
  if (!result) {
    throw new NotFoundError("AAA No chirp with that id found.");
  }

  res.status(204).send();
}
