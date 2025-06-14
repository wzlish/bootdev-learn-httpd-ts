import Express from "express";

export function handlerRediness(_: Express.Request, res: Express.Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("OK");
}
