import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import type { InstallOption, UninstallOption } from "./types";

type OsRelease = {
  ID: string;
};

const DEFAULT_OS_RELEASE_PATH = "/etc/os-release";
const REQUIRED_KEYS = ["ID"];

export const loadOsRelease = async (
  path = DEFAULT_OS_RELEASE_PATH,
): Promise<OsRelease> => {
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
      throw new Error(`Missing ${key} in os-release`);
    }
  }

  return osRelease as OsRelease;
};

interface PackageManager {
  install(packageName: string[], opts?: InstallOption): Promise<void>;
  uninstall(packageName: string[], opts?: UninstallOption): Promise<void>;
}

const exec = (
  cmd: string,
  args: string[],
  env?: Record<string, string>,
): Promise<void> => {
  const process = spawn(cmd, args, { env });

  process.stdout.on("data", (data: Buffer) => {
    console.log(`[${cmd}] ${data.toString()}`);
  });
  process.stderr.on("data", (data: Buffer) => {
    console.error(`[${cmd}] ${data}`);
  });

  return new Promise((resolve, reject) => {
    process.on("close", (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited with code ${code}`));
      }
    });
  });
};

export class ZypperPackageManager implements PackageManager {
  async install(packageName: string[], opts?: InstallOption): Promise<void> {
    if (opts?.sudo) {
      await exec("sudo", ["zypper", "install", "--no-confirm", ...packageName]);
    } else {
      await exec("zypper", ["install", "--no-confirm", ...packageName]);
    }
  }

  async uninstall(packageName: string[]): Promise<void> {
    await exec("zypper", ["remove", "--no-confirm", ...packageName]);
  }
}

export class AptPackageManager implements PackageManager {
  async install(packageName: string[], opts?: InstallOption): Promise<void> {
    const env = { DEBIAN_FRONTEND: "noninteractive" };
    if (opts?.sudo) {
      await exec("sudo", ["apt-get", "update"]);
      await exec(
        "sudo",
        [
          "apt-get",
          "install",
          "--yes",
          "--no-install-recommends",
          ...packageName,
        ],
        env,
      );
    } else {
      await exec("apt-get", ["update"]);
      await exec(
        "apt-get",
        ["install", "--yes", "--no-install-recommends", ...packageName],
        env,
      );
    }
  }

  async uninstall(
    packageName: string[],
    opts?: UninstallOption,
  ): Promise<void> {
    const env = { DEBIAN_FRONTEND: "noninteractive" };
    if (opts?.sudo) {
      await exec("sudo", ["apt-get", "remove", "--yes", ...packageName], env);
    } else {
      await exec("apt-get", ["remove", "--yes", ...packageName], env);
    }
  }
}

export class YumPackageManager implements PackageManager {
  async install(packageName: string[], opts?: InstallOption): Promise<void> {
    if (opts?.sudo) {
      await exec("sudo", [
        "yum",
        "install",
        "--assumeyes",
        "--setopt=install_weak_deps=False",
        ...packageName,
      ]);
    } else {
      await exec("yum", [
        "remove",
        "--assumeyes",
        "--setopt=install_weak_deps=False",
        ...packageName,
      ]);
    }
  }

  async uninstall(
    packageName: string[],
    opts?: UninstallOption,
  ): Promise<void> {
    if (opts?.sudo) {
      await exec("sudo", ["yum", "uninstall", "--assumeyes", ...packageName]);
    } else {
      await exec("yum", ["uninstall", "--assumeyes", ...packageName]);
    }
  }
}

export class EchoPackageManager implements PackageManager {
  async install(packageName: string[]): Promise<void> {
    console.log(`Would install: ${packageName.join(", ")}`);
  }

  async uninstall(packageName: string[]): Promise<void> {
    console.log(`Would uninstall: ${packageName.join(", ")}`);
  }
}

export const createPackageManager = async (): Promise<PackageManager> => {
  if (process.env.PACKAGE_MANAGER === "echo") {
    return new EchoPackageManager();
  }

  const osRelease = await loadOsRelease();
  if (process.platform !== "linux") {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  /**
   * The specification of os-release is available at:
   * https://www.freedesktop.org/software/systemd/man/latest/os-release.html
   */
  switch (osRelease.ID) {
    case "rhel":
    case "centos":
    case "ol":
    case "fedora":
      return new YumPackageManager();
    case "debian":
    case "ubuntu":
    case "linuxmint":
      return new AptPackageManager();
    case "opensuse":
    case "opensuse-leap":
    case "sles":
      return new ZypperPackageManager();
  }

  throw new Error(`Unsupported distribution: ${osRelease.ID}`);
};
