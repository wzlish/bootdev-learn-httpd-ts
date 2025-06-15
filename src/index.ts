import express from "express";
import {
  handlerRediness,
  handlerAdminMetrics,
  handlerAdminResetHits,
} from "./handlers.js";
import { middlewareMetricsInc, middlewareLogResponses } from "./middleware.js";
const app = express();
const PORT = 8080;

app.get("/api/healthz", handlerRediness);
app.use("/", middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", handlerAdminMetrics);
app.get("/admin/reset", handlerAdminResetHits);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
