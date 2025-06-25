import Express from "express";
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "../handlers_error.js";
import { updateUser } from "../db/queries/users.js";
import { isValidUuid } from "../util.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";

export async function handlerPolkerWebhook(
  req: Express.Request,
  res: Express.Response,
) {
  if (getAPIKey(req) !== config.polka.key) {
    throw new UnauthorizedError("Unauthorized");
  }

  if (!req.body) {
    throw new BadRequestError("Missing or invalid JSON body");
  }

  const { event, data } = req.body;

  if (!event) {
    throw new BadRequestError("Missing body.event");
  }

  if (!data || !data.userId || !isValidUuid(data.userId)) {
    throw new BadRequestError("Missing or malformed body.data.userId.");
  }

  if (event == "user.upgraded") {
    const result = await updateUser(data.userId, {
      isChirpyRed: true,
    });
    if (!result) {
      throw new NotFoundError("No such user found");
    }
  }

  res.status(204).send();
}
