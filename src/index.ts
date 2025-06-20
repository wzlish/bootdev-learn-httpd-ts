import express from "express";
import {
  handlerRediness,
  handlerAdminMetrics,
  handlerAdminReset,
} from "./handlers.js";

import {
  handlerUserCreate,
  handlerNewChirp,
  handlerGetChirps,
} from "./handlers_user.js";

import { handlerErrors } from "./handlers_error.js";

import { middlewareMetricsInc, middlewareLogResponses } from "./middleware.js";
const app = express();
const PORT = 8080;

app.use("/", middlewareLogResponses);
app.use("/api", express.json());

app.get("/api/healthz", async (req, res, next) => {
  try {
    await handlerRediness(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/chirps", async (req, res, next) => {
  try {
    await handlerNewChirp(req, res);
  } catch (err) {
    next(err);
  }
});

app.get("/api/chirps", async (req, res, next) => {
  try {
    await handlerGetChirps(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/users/", async (req, res, next) => {
  try {
    await handlerUserCreate(req, res);
  } catch (err) {
    next(err);
  }
});

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", async (req, res, next) => {
  try {
    await handlerAdminMetrics(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/admin/reset", async (req, res, next) => {
  try {
    await handlerAdminReset(req, res);
  } catch (err) {
    next(err);
  }
});

app.use(handlerErrors);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
