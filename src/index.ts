import express from "express";
import {
  handlerRediness,
  handlerAdminMetrics,
  handlerAdminReset,
} from "./handlers.js";

import { handlerUserCreate, handlerUserUpdate } from "./handlers_user.js";

import {
  handlerUserLogin,
  handlerTokenRefresh,
  handlerTokenRevoke,
} from "./handlers_auth.js";

import {
  handlerNewChirp,
  handlerGetChirps,
  handlerGetChirp,
  handlerDeleteChirp,
} from "./handlers_chirps.js";

import { handlerPolkerWebhook } from "./webhooks/polka.js";

import { handlerErrors } from "./handlers_error.js";

import { middlewareMetricsInc, middlewareLogResponses } from "./middleware.js";
const app = express();
const PORT = 8080;

app.use("/", middlewareLogResponses);
app.use("/api", express.json());

/* API */
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

app.get("/api/chirps/:id", async (req, res, next) => {
  try {
    await handlerGetChirp(req, res);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/chirps/:id", async (req, res, next) => {
  try {
    await handlerDeleteChirp(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/users", async (req, res, next) => {
  try {
    await handlerUserCreate(req, res);
  } catch (err) {
    next(err);
  }
});

app.put("/api/users", async (req, res, next) => {
  try {
    await handlerUserUpdate(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/refresh", async (req, res, next) => {
  try {
    await handlerTokenRefresh(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/revoke", async (req, res, next) => {
  try {
    await handlerTokenRevoke(req, res);
  } catch (err) {
    next(err);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    await handlerUserLogin(req, res);
  } catch (err) {
    next(err);
  }
});
/* END API */

/* Webhooks */
app.post("/api/polka/webhooks/", async (req, res, next) => {
  try {
    await handlerPolkerWebhook(req, res);
  } catch (err) {
    next(err);
  }
});
/* End Webhooks */

/* Main App */
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

/* Admin */
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
/* End Admin */

app.use(handlerErrors);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
