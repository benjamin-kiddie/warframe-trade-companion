import dotenv from "dotenv";
import { app, BrowserWindow } from "electron";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createPrismaClient } from "./db";
import { registerItemsIpc } from "./ipc/items";
import { registerTransactionsIpc } from "./ipc/transactions";
import { registerWishlistIpc } from "./ipc/wishlist";
import { startWishlistPoller } from "./wishlistPoller";

// Both resolve relative to dist-electron's own actual location, so these hold true whether
// dist-electron/ is the repo root's build output (dev) or sits inside the packaged app (prod).
const OUT_DIR = path.join(__dirname, "../out");
const APP_DIR = path.join(__dirname, "..");

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Vite emits relative asset paths (base: "./"), so file:// resolves them correctly on its own.
  win.loadFile(path.join(OUT_DIR, "index.html"));
  win.webContents.once("did-finish-load", () => console.log("window loaded"));
}

/**
 * Runs schema migrations against the given database, spawned as a plain Node script since the
 * Prisma CLI isn't meant to be required() directly. Runs from APP_DIR since prisma.config.mjs's
 * paths ("prisma/schema.prisma", "prisma/migrations") are resolved relative to cwd.
 */
function runMigrations(databaseUrl: string) {
  const prismaCli = require.resolve("prisma/build/index.js");
  execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
    cwd: APP_DIR,
    env: { ...process.env, DATABASE_URL: databaseUrl, ELECTRON_RUN_AS_NODE: "1" },
    stdio: "inherit",
  });
}

app.whenReady().then(() => {
  const userDataDir = app.getPath("userData");

  // A .env placed in userData survives packaging/updates and never ships inside the app bundle.
  // Falls back to the repo-root .env (via cwd) for dev, since dotenv won't override values already set.
  dotenv.config({ path: path.join(userDataDir, ".env") });
  dotenv.config();

  const dbPath = path.join(userDataDir, "database.db");
  const databaseUrl = `file:${dbPath}`;

  runMigrations(databaseUrl);
  const prisma = createPrismaClient(databaseUrl);

  registerItemsIpc();
  registerTransactionsIpc(prisma);
  registerWishlistIpc(prisma);
  startWishlistPoller(prisma);

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
