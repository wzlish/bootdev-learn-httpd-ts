import Express from "express";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "./handlers_error.js";
import {
  createUser,
  getUser,
  newRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "./db/queries/users.js";
import { createChirp, getChirps, getChirp } from "./db/queries/chirps.js";
import { config } from "./config.js";
import { isValidUuid, selectFields } from "./util.js";
import {
  hashPassword,
  checkPasswordHash,
  makeJWT,
  validateJWT,
  getBearerToken,
  makeRefreshToken,
} from "./auth.js";

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

export async function handlerUserLogin(
  req: Express.Request,
  res: Express.Response,
) {
  if (!req.body) {
    throw new BadRequestError("Missing or invalid JSON body");
  }

  type parameters = {
    email: string;
    password: string;
    expiresInSeconds: number;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError(`You must provide an email address.`);
  }

  if (!params.password) {
    throw new BadRequestError(`You must provide a password.`);
  }

  const userDetails = await getUser(params.email);
  if (!userDetails || userDetails.hashedPassword == "unset") {
    checkPasswordHash(params.password, config.db.bcrypt_dummy);
    throw new UnauthorizedError("Invalid email address or password.");
  }

  const validPassword = await checkPasswordHash(
    params.password,
    userDetails.hashedPassword,
  );

  if (!validPassword) {
    throw new UnauthorizedError("Invalid email address or password.");
  }

  const jwtToken = makeJWT(
    userDetails.id,
    config.jwt.defaultDur,
    config.jwt.secret,
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshDur);

  const refreshToken = await newRefreshToken({
    id: makeRefreshToken(),
    userId: userDetails.id,
    expiresAt: expiresAt,
  });

  if (!refreshToken) {
    throw new Error("Internal server error");
  }

  const responce = {
    ...selectFields(userDetails, userResponseKeys),
    token: jwtToken,
    refreshToken: refreshToken.id,
  };
  res.status(200).send(responce);
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

export async function handlerTokenRefresh(
  req: Express.Request,
  res: Express.Response,
) {
  const sentToken = getBearerToken(req);
  if (!sentToken) {
    throw new BadRequestError("Missing refresh token.");
  }

  const refreshToken = await getRefreshToken(sentToken);
  if (!refreshToken) {
    throw new UnauthorizedError("Invalid token.");
  }

  const jwtToken = makeJWT(
    refreshToken.userId,
    config.jwt.defaultDur,
    config.jwt.secret,
  );
  res.status(200).send({ token: jwtToken });
}

export async function handlerTokenRevoke(
  req: Express.Request,
  res: Express.Response,
) {
  const sentToken = getBearerToken(req);
  if (!sentToken) {
    throw new BadRequestError("Missing refresh token.");
  }
  await revokeRefreshToken(sentToken);
  res.status(204).send();
}
