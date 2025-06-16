import Express from "express";
import { apiConfig } from "./config.js";

export function handlerRediness(_: Express.Request, res: Express.Response) {
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
      <p>Chirpy has been visited ${apiConfig.fileserverHits} times!</p>
    </body>
  </html>`);
}

export async function handlerAdminResetHits(
  _: Express.Request,
  res: Express.Response,
) {
  apiConfig.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("Hits reset");
}

export async function handlerValidateChirp(
  req: Express.Request,
  res: Express.Response,
) {
  if (!req.body) {
    res
      .status(400)
      .send(JSON.stringify({ error: "Missing or invalid JSON body" }));
    return;
  }

  type parameters = {
    body: string;
  };
  const params: parameters = req.body;

  if (params.body.length > 140) {
    res.status(400).send(JSON.stringify({ error: "Chirp is too long" }));
    return;
  }
  res.status(200).send(JSON.stringify({ valid: true }));
  return;
}
