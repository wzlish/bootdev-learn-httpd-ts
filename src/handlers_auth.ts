import Express from "express";
import { BadRequestError, UnauthorizedError } from "./handlers_error.js";
import {
  getUser,
  newRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "./db/queries/users.js";
import { config } from "./config.js";
import { selectFields } from "./util.js";
import {
  checkPasswordHash,
  makeJWT,
  getBearerToken,
  makeRefreshToken,
} from "./auth.js";

import { userResponseKeys } from "./handlers_user.js";

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

  const response = {
    ...selectFields(userDetails, userResponseKeys),
    token: jwtToken,
    refreshToken: refreshToken.id,
  };
  res.status(200).send(response);
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
