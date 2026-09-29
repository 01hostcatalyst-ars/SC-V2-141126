import chromium from "@sparticuz/chromium";
import puppeteer, { Browser } from "puppeteer-core";
import fs from "fs";
import path from "path";

/**
 * Resolves the Chromium executable path across Windows local development
 * and Linux serverless runtime environments (Vercel / AWS Lambda).
 */
export async function getChromiumExecutablePath(): Promise<string> {
  if (process.platform === "win32") {
    const candidatePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    throw new Error("Could not locate local Chrome or Edge browser executable on Windows.");
  }

  // 1. If already extracted to /tmp/chromium (e.g. warm Lambda container), use it immediately
  const tmpChromium = path.join("/tmp", "chromium");
  if (fs.existsSync(tmpChromium)) {
    return tmpChromium;
  }

  // 2. Search known candidate locations for @sparticuz/chromium bin directory on serverless
  const candidateBinDirs = [
    path.join(process.cwd(), "node_modules/@sparticuz/chromium/bin"),
    "/var/task/node_modules/@sparticuz/chromium/bin",
    path.join(process.cwd(), ".next/server/vendor-chunks/node_modules/@sparticuz/chromium/bin"),
  ];

  for (const binDir of candidateBinDirs) {
    if (fs.existsSync(binDir)) {
      return await chromium.executablePath(binDir);
    }
  }

  // 3. Fallback to default resolution
  return await chromium.executablePath();
}

/**
 * Returns optimal launch arguments for headless Puppeteer execution.
 */
export function getChromiumLaunchArgs(): string[] {
  if (process.platform === "win32") {
    return [];
  }
  return [...chromium.args, "--disable-dev-shm-usage"];
}

/**
 * Launches a Puppeteer browser instance pre-configured for the current environment.
 */
export async function launchBrowser(): Promise<Browser> {
  const executablePath = await getChromiumExecutablePath();
  const args = getChromiumLaunchArgs();

  return await puppeteer.launch({
    args,
    executablePath,
    headless: true,
  });
}
