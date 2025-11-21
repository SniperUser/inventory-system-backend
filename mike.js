import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let backendProcess;

const LOG_FILE = path.join(app.getPath("userData"), "backend.log");

// 🚫 Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

function log(...args) {
  const msg = `[MAIN] ${args.join(" ")}\n`;
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg);
}

// ✅ Determine backend path
function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend", "server.js");
  } else {
    return path.join(__dirname, "src", "admin", "backend", "server.js");
  }
}

// ✅ Start backend (with logging)
function startBackend() {
  const serverPath = getServerPath();
  log("🧩 Backend path:", serverPath);

  // Create log file
  fs.writeFileSync(LOG_FILE, "=== Backend log start ===\n");

  backendProcess = spawn("node", [serverPath], {
    shell: false,
    stdio: ["pipe", "pipe", "pipe"],
  });

  backendProcess.stdout.on("data", (data) => {
    log(`[BACKEND] ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    log(`[BACKEND ERROR] ${data}`);
  });

  backendProcess.on("error", (err) => {
    log("❌ Failed to start backend:", err);
  });

  backendProcess.on("exit", (code) => {
    log(`⚙️ Backend exited with code: ${code}`);
  });
}

// ✅ Wait for backend
async function waitForServer(url, retries = 20, interval = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      log(`🌐 Checking backend availability (${i + 1}/${retries})...`);
      await axios.get(url);
      log("✅ Backend is ready.");
      return true;
    } catch {
      log("⏳ Backend not yet ready, retrying...");
      await new Promise((r) => setTimeout(r, interval));
    }
  }
  throw new Error("Backend not responding after retries.");
}

// ✅ Create window
async function createMainWindow() {
  log("🪟 Creating main window...");
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const loadingPath = path.join(__dirname, "loading.html");
  win.loadFile(loadingPath);

  startBackend();

  try {
    log("🚀 Waiting for backend to respond...");
    await waitForServer("http://localhost:5000/api/dashboard");

    if (process.env.ELECTRON_START_URL) {
      log(
        "💻 Dev mode detected, loading React app from:",
        process.env.ELECTRON_START_URL
      );
      win.loadURL(process.env.ELECTRON_START_URL);
    } else {
      const indexPath = path.join(__dirname, "build", "index.html");
      log("📦 Loading built React app from:", indexPath);
      win.loadFile(indexPath);
    }
  } catch (err) {
    log("❌ Backend failed to start fully:", err);
    const errorMsg = `
      <html>
        <body style="background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:20px;">
          <h2>❌ Backend failed to start</h2>
          <p>See log file for details:</p>
          <p><code>${LOG_FILE}</code></p>
          <p>Make sure server.js works when run manually.</p>
        </body>
      </html>`;
    win.loadURL(`data:text/html,${encodeURIComponent(errorMsg)}`);
  }
}

app.whenReady().then(() => {
  log("⚙️ App is ready");
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  if (backendProcess) backendProcess.kill();
});
