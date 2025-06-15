import Express from "express";
import { apiConfig } from "./config.js";

export function handlerRediness(_: Express.Request, res: Express.Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("OK");
}

export function handlerShowHits(_: Express.Request, res: Express.Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(`Hits: ${apiConfig.fileserverHits}`);
}

export function handlerResetHits(_: Express.Request, res: Express.Response) {
  apiConfig.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("Hits reset");
}
