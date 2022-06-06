import express from "express";
import responseTime from "response-time";
import { createClient } from "redis";
import { config } from "dotenv";
import postRouter from "./routes.js";
export const redisClient = createClient();

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

config();

const app = express();
app.use(express.json());
app.use(responseTime());

app.use("/post", postRouter);

const port = process.env.PORT || 6000;
app.listen(port, () => {
  console.log("Node server started, and listening on port " + port);
});
