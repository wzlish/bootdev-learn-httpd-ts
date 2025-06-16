import express from "express";
import {
  handlerRediness,
  handlerAdminMetrics,
  handlerAdminResetHits,
  handlerValidateChirp,
} from "./handlers.js";
import { middlewareMetricsInc, middlewareLogResponses } from "./middleware.js";
const app = express();
const PORT = 8080;

app.use("/", middlewareLogResponses);
app.use("/api", express.json());

app.get("/api/healthz", handlerRediness);
app.post("/api/validate_chirp", handlerValidateChirp);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", handlerAdminMetrics);
app.post("/admin/reset", handlerAdminResetHits);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
