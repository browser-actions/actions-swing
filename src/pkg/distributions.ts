import { exec } from "@actions/exec";
import { getOsReleaseId } from "../runtime";
import type { InstallOption, UninstallOption } from "./types";

interface PackageManager {
  install(packageName: string[], opts?: InstallOption): Promise<void>;
  uninstall(packageName: string[], opts?: UninstallOption): Promise<void>;
}

export class ZypperPackageManager implements PackageManager {
  async install(packageName: string[], opts?: InstallOption): Promise<void> {
    if (opts?.sudo) {
      await exec("sudo", ["zypper", "install", "--no-confirm", ...packageName]);
    } else {
      await exec("zypper", ["install", "--no-confirm", ...packageName]);
    }
  }

  async uninstall(
    packageName: string[],
    opts?: UninstallOption,
  ): Promise<void> {
    if (opts?.sudo) {
      await exec("sudo", ["zypper", "remove", "--no-confirm", ...packageName]);
    } else {
      await exec("zypper", ["remove", "--no-confirm", ...packageName]);
    }
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
        { env },
      );
    } else {
      await exec("apt-get", ["update"]);
      await exec(
        "apt-get",
        ["install", "--yes", "--no-install-recommends", ...packageName],
        { env },
      );
    }
  }

  async uninstall(
    packageName: string[],
    opts?: UninstallOption,
  ): Promise<void> {
    const env = { DEBIAN_FRONTEND: "noninteractive" };
    if (opts?.sudo) {
      await exec("sudo", ["apt-get", "remove", "--yes", ...packageName], {
        env,
      });
    } else {
      await exec("apt-get", ["remove", "--yes", ...packageName], { env });
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
        "install",
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
      await exec("sudo", ["yum", "remove", "--assumeyes", ...packageName]);
    } else {
      await exec("yum", ["remove", "--assumeyes", ...packageName]);
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

  if (process.platform !== "linux") {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  const osReleaseId = await getOsReleaseId();

  /**
   * The specification of os-release is available at:
   * https://www.freedesktop.org/software/systemd/man/latest/os-release.html
   */
  switch (osReleaseId) {
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

  throw new Error(`Unsupported distribution: ${osReleaseId}`);
};
