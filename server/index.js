import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleChat } from "../api/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "dorkforge-api" });
});

app.post("/api/chat", handleChat);

app.listen(PORT, () => {
  console.log(`DorkForge API running at http://localhost:${PORT}`);
});
