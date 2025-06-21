import Express from "express";
import { config } from "./config.js";

export function middlewareLogResponses(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`,
      );
    }
  });
  next();
}

export function middlewareMetricsInc(
  _: Express.Request,
  __: Express.Response,
  next: Express.NextFunction,
) {
  config.api.fileserverHits++;
  next();
}
