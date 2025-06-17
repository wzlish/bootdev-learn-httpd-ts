import express from "express";
import {
  handlerRediness,
  handlerAdminMetrics,
  handlerAdminResetHits,
  handlerValidateChirp,
} from "./handlers.js";
import { handlerErrors } from "./error_handler.js";

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

app.post("/api/validate_chirp", async (req, res, next) => {
  try {
    await handlerValidateChirp(req, res);
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
    await handlerAdminResetHits(req, res);
  } catch (err) {
    next(err);
  }
});

app.use(handlerErrors);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
