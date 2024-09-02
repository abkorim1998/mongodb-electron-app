import { app as a, ipcMain as m, BrowserWindow as g } from "electron";
import { fileURLToPath as u } from "node:url";
import i from "node:path";
import { spawn as b } from "node:child_process";
import f from "path";
import d from "fs";
import { MongoClient as E } from "mongodb";
const P = f.dirname(u(import.meta.url));
let s;
function R() {
  const e = process.platform, t = f.join(P, "..", "mongodb", e, "mongod.exe"), o = f.join(a.getPath("userData"), "mongodb-data");
  d.existsSync(o) || d.mkdirSync(o, { recursive: !0 });
  const n = f.join(o, "mongo.log");
  d.existsSync(n) || d.writeFileSync(n, ""), s = b(t, [
    "--dbpath",
    o,
    "--logpath",
    n,
    "--bind_ip",
    "127.0.0.1",
    "--port",
    "27017"
  ], {
    detached: !0,
    stdio: "ignore"
    // Ignore stdout and stderr
  }), s.unref(), s.on("error", (l) => {
    throw console.error(`MongoDB failed to start: ${l.message}`), l;
  }), console.log("MongoDB started successfully");
}
function h() {
  s && (console.log("Stopping MongoDB..."), s.kill("SIGINT"), s = null);
}
const v = "mongodb://127.0.0.1:27017", I = "abcd";
let r = null;
async function T() {
  const e = new E(v);
  await e.connect(), r = e.db(I), console.log("Connected to MongoDB");
}
async function j(e) {
  if (!r)
    throw new Error("Database not initialized");
  return r.collection(e).find({}).toArray();
}
async function O(e, t) {
  if (!r)
    throw new Error("Database not initialized");
  return r.collection(e).insertOne(t);
}
async function w(e, t) {
  if (!r)
    throw new Error("Database not initialized");
  return r.collection(e).findOne({
    _id: t
  });
}
async function S(e, t) {
  if (!r)
    throw new Error("Database not initialized");
  return r.collection(e).deleteOne(t);
}
m.handle("fetch-data", async (e, t) => {
  try {
    return await j(t);
  } catch (o) {
    throw console.error("Error fetching data:", o), o;
  }
});
m.handle("insert-data", async (e, t, o) => {
  try {
    const l = (await O(t, o)).insertedId;
    return await w(t, l);
  } catch (n) {
    throw console.error("Error inserting data:", n), n;
  }
});
m.handle("fetch-databy-id", async (e, t, o) => {
  try {
    return await w(t, o);
  } catch (n) {
    throw console.error("Error fetching data:", n), n;
  }
});
m.handle("delete-data-by-id", async (e, t, o) => {
  try {
    console.log(o);
    const n = await S(t, o);
    return console.log(n), n;
  } catch (n) {
    throw console.error("Error deleting data:", n), n;
  }
});
const y = i.dirname(u(import.meta.url));
process.env.APP_ROOT = i.join(y, "..");
const p = process.env.VITE_DEV_SERVER_URL, q = i.join(process.env.APP_ROOT, "dist-electron"), D = i.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? i.join(process.env.APP_ROOT, "public") : D;
let c;
function _() {
  c = new g({
    icon: i.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: i.join(y, "preload.mjs")
    }
  }), c.webContents.on("did-finish-load", () => {
    c == null || c.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), p ? c.loadURL(p) : c.loadFile(i.join(D, "index.html"));
}
a.on("window-all-closed", () => {
  process.platform !== "darwin" && a.quit();
});
a.on("before-quit", () => {
  h();
});
a.on("will-quit", () => {
  h();
});
a.on("quit", () => {
  h();
});
a.on("activate", () => {
  g.getAllWindows().length === 0 && _();
});
a.whenReady().then(async () => {
  _(), R(), await T();
});
export {
  q as MAIN_DIST,
  D as RENDERER_DIST,
  p as VITE_DEV_SERVER_URL
};
