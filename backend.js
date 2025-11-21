// backend.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startBackend() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Example API
  app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from embedded backend!" });
  });

  // Serve React build in production
  if (process.env.NODE_ENV === "production" || app.isPackaged) {
    app.use(express.static(path.join(__dirname, "build")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    });
  }

  const PORT = process.env.PORT || 5000;

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${PORT}`);
      resolve();
    });
  });
}
