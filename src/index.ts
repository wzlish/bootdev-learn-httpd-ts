import express from "express";
import {
  handlerRediness,
  handlerShowHits,
  handlerResetHits,
} from "./handlers.js";
import { middlewareMetricsInc, middlewareLogResponses } from "./middleware.js";
const app = express();
const PORT = 8080;

app.get("/healthz", handlerRediness);
app.use("/", middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/metrics", handlerShowHits);
app.get("/reset", handlerResetHits);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
