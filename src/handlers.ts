import Express from "express";
import { config } from "./config.js";
import { ForbiddenError } from "./handlers_error.js";
import { clearUsers } from "./db/queries/users.js";
export async function handlerRediness(
  _: Express.Request,
  res: Express.Response,
) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("OK");
}

export async function handlerAdminMetrics(
  _: Express.Request,
  res: Express.Response,
) {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<html>
    <body>
      <h1>Welcome, Chirpy Admin</h1>
      <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
    </body>
  </html>`);
}

export async function handlerAdminReset(
  _: Express.Request,
  res: Express.Response,
) {
  if (config.api.platform != "dev") {
    throw new ForbiddenError("No");
  }
  await clearUsers();
  config.api.fileserverHits = 0;
  res.status(200).send(""); // Todo: 204, but the boot.dev tests expect 200.
}
