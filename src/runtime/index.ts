import * as fs from "node:fs/promises";

const DEFAULT_OS_RELEASE_PATH = "/etc/os-release";
const REQUIRED_KEYS = ["ID"];

type OsRelease = {
  ID: string;
} & Record<string, string>;

export const loadOsRelease = async (
  path = DEFAULT_OS_RELEASE_PATH,
): Promise<OsRelease> => {
  if (process.platform !== "linux") {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  const content = await fs.readFile(path, "utf-8");
  const osRelease: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const parts = line.split("=");
    if (parts.length !== 2) {
      continue;
    }
    const key = parts[0];
    const value =
      parts[1].startsWith('"') && parts[1].endsWith('"')
        ? parts[1].slice(1, -1)
        : parts[1];

    osRelease[key] = value;
  }

  for (const key of REQUIRED_KEYS) {
    if (typeof osRelease[key] !== "string" || osRelease[key].length === 0) {
      throw new Error(`Missing ${key} in ${path}`);
    }
  }

  return osRelease as OsRelease;
};

export const getOsReleaseId = async (): Promise<string> => {
  const osRelease = await loadOsRelease();
  return osRelease.ID;
};
