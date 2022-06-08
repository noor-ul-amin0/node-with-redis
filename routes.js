import { Router } from "express";
import axios from "axios";
import { redisClient } from "./index.js";
const router = Router();
const api = axios.create({
  headers: {
    "app-id": process.env.DUMMPY_API_KEY,
  },
  baseURL: process.env.DUMMPY_API_BASE_URL,
});
router
  .route("/")
  .get(async (req, res) => {
    try {
      const posts = await redisClient.get("posts");
      if (posts) {
        return res.json(JSON.parse(posts));
      }
      const response = await api.get(`/post?${req.query}`);
      await redisClient.set("posts", JSON.stringify(response.data), {
        EX: "3600",
      });
      return res.status(200).json(response.data);
    } catch (err) {
      console.log("ERROR OCCURED IN GET POSTS", err);
      res.status(500).send(err.message);
    }
  })
  .post(async (req, res) => {
    try {
      await redisClient.expire("posts", 1);
      const response = await api.post(`/post/create`, req.body);
      return res.status(200).send(response);
    } catch (err) {
      console.log("ERROR OCCURED IN CREATE POST", err?.response);
      return res.status(500).send(err?.response);
    }
  });
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const post = await redisClient.get(`post-${req.params.id}`);
      if (post) {
        return res.json(JSON.parse(post));
      }
      const response = await api.get(`/post/${req.params.id}`);
      await redisClient.set(
        `post-${req.params.id}`,
        JSON.stringify(response.data),
        {
          EX: "3600",
        }
      );
      res.status(200).send(response);
    } catch (err) {
      console.log("ERROR OCCURED IN GET POST", err?.response);
      return res.status(500).send(err?.response);
    }
  })
  .put(async (req, res) => {
    try {
      const response = await api.put(`/post/${req.params.id}`, req.body);
      await redisClient.expire("posts", 1);
      await redisClient.expire(`post-${req.params.id}`, 1);
      res.status(200).send(response);
    } catch (err) {
      console.log("ERROR OCCURED IN UPDATE POST", err?.response);
      return res.status(500).send(err?.response);
    }
  })
  .delete(async (req, res) => {
    try {
      const response = await api.delete(`/post/${req.params.id}`);
      await redisClient.expire("posts", 1);
      await redisClient.expire(`post-${req.params.id}`, 1);
      res.status(200).send(response);
    } catch (err) {
      console.log("ERROR OCCURED IN DELETE POST", err?.response);
      return res.status(500).send(err?.response);
    }
  });

export default router;
