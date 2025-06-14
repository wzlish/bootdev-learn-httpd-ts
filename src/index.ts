import express from "express";
import { handlerRediness } from "./handlers.js";
const app = express();
const PORT = 8080;

app.get("/healthz", handlerRediness);
app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
