import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend", "server.js");
  } else {
    return path.join(__dirname, "src", "admin", "backend", "server.js");
  }
}

async function startBackendServer() {
  const serverPath = getServerPath();
  const { startServer } = await import(pathToFileURL(serverPath).href);
  await startServer();
  console.log("✅ Backend server started.");
}

async function waitForServer(url, retries = 20, interval = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await axios.get(url);
      console.log("✅ Backend is ready.");
      return true;
    } catch {
      console.log("⏳ Waiting for backend...");
      await new Promise((r) => setTimeout(r, interval));
    }
  }
  throw new Error("Backend not responding.");
}

async function createDeliveryWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 👉 Show loading screen first
  const loadingPath = app.isPackaged
    ? path.join(__dirname, "loading.html") // in packaged build (inside asar root)
    : path.join(__dirname, "loading.html"); // in dev (same folder as mike-delivery.js)

  win.loadFile(loadingPath);

  // Start backend
  startBackendServer().then(async () => {
    try {
      // Wait until backend responds
      await waitForServer("http://localhost:5000/api/dashboard");

      // Then load your React app
      if (process.env.ELECTRON_START_URL) {
        win.loadURL(`${process.env.ELECTRON_START_URL}#/delivery`);
      } else {
        const indexPath = path.join(__dirname, "build", "index.html");
        win.loadFile(indexPath, { hash: "delivery" });
      }
    } catch (err) {
      console.error(err);
      win.loadURL("data:text/html,<h1>❌ Backend failed to start</h1>");
    }
  });
}

app.whenReady().then(() => {
  createDeliveryWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createDeliveryWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
