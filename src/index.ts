import express from "express";
import {
  handlerRediness,
  handlerShowHits,
  handlerResetHits,
} from "./handlers.js";
import { middlewareMetricsInc, middlewareLogResponses } from "./middleware.js";
const app = express();
const PORT = 8080;

app.get("/api/healthz", handlerRediness);
app.use("/", middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/metrics", handlerShowHits);
app.get("/api/reset", handlerResetHits);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
