import { app, ipcMain, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import { spawn } from "node:child_process";
import path from "path";
import fs from "fs";
import { MongoClient } from "mongodb";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
let mongoProcess;
function startMongoDB() {
  const platform = process.platform;
  const mongoPath = platform === "darwin" ? path.join(__dirname$1, "..", "mongodb", platform, "bin", "mongod") : path.join(__dirname$1, "..", "mongodb", platform, "mongod.exe");
  const dbPath = path.join(app.getPath("userData"), "mongodb-data");
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });
  const logPath = path.join(dbPath, "mongo.log");
  if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, "");
  mongoProcess = spawn(mongoPath, [
    "--dbpath",
    dbPath,
    "--logpath",
    logPath,
    "--bind_ip",
    "127.0.0.1",
    "--port",
    "27017"
  ], {
    detached: true,
    stdio: "ignore"
    // Ignore stdout and stderr
  });
  mongoProcess.unref();
  mongoProcess.on("error", (err) => {
    console.error(`MongoDB failed to start: ${err.message}`);
    throw err;
  });
  console.log("MongoDB started successfully");
}
function stopMongoDB() {
  if (mongoProcess) {
    console.log("Stopping MongoDB...");
    mongoProcess.kill("SIGINT");
    mongoProcess = null;
  }
}
const mongoUri = "mongodb://127.0.0.1:27017";
const dbName = "abcd";
let db = null;
async function connectToMongoDB() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);
  console.log("Connected to MongoDB");
}
async function fetchData(collectionName) {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const collection = db.collection(collectionName);
  return collection.find({}).toArray();
}
async function insertData(collectionName, data) {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const collection = db.collection(collectionName);
  return collection.insertOne(data);
}
async function fetchDatabyId(collectionName, id) {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const collection = db.collection(collectionName);
  return collection.findOne({
    _id: id
  });
}
async function deleteData(collectionName, data) {
  if (!db) {
    throw new Error("Database not initialized");
  }
  const collection = db.collection(collectionName);
  return collection.deleteOne(data);
}
ipcMain.handle("fetch-data", async (_event, collectionName) => {
  try {
    const data = await fetchData(collectionName);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
});
ipcMain.handle("insert-data", async (_event, collectionName, data) => {
  try {
    const result = await insertData(collectionName, data);
    const id = result.insertedId;
    const resultData = await fetchDatabyId(collectionName, id);
    return resultData;
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error;
  }
});
ipcMain.handle("fetch-databy-id", async (_event, collectionName, id) => {
  try {
    const data = await fetchDatabyId(collectionName, id);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
});
ipcMain.handle("delete-data-by-id", async (_event, collectionName, data) => {
  try {
    console.log(data);
    const result = await deleteData(collectionName, data);
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
});
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("before-quit", () => {
  stopMongoDB();
});
app.on("will-quit", () => {
  stopMongoDB();
});
app.on("quit", () => {
  stopMongoDB();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(async () => {
  createWindow();
  startMongoDB();
  await connectToMongoDB();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
