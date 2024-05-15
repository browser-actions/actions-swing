import { exec } from "@actions/exec";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  AptPackageManager,
  YumPackageManager,
  ZypperPackageManager,
} from "../../src/pkg/distributions";

beforeEach(() => {
  vi.mock("@actions/exec", () => ({ exec: vi.fn() }));
});

describe("AptPackageManager", () => {
  const apt = new AptPackageManager();
  const env = { DEBIAN_FRONTEND: "noninteractive" };

  test("install", async () => {
    await apt.install(["jq"]);
    expect(exec).toHaveBeenCalledWith("apt-get", ["update"]);
    expect(exec).toHaveBeenCalledWith(
      "apt-get",
      ["install", "--yes", "--no-install-recommends", "jq"],
      { env },
    );
  });

  test("install with sudo", async () => {
    await apt.install(["jq"], { sudo: true });
    expect(exec).toHaveBeenCalledWith("sudo", ["apt-get", "update"]);
    expect(exec).toHaveBeenCalledWith(
      "sudo",
      ["apt-get", "install", "--yes", "--no-install-recommends", "jq"],
      { env },
    );
  });

  test("uninstall", async () => {
    await apt.uninstall(["jq"]);
    expect(exec).toHaveBeenCalledWith("apt-get", ["remove", "--yes", "jq"], {
      env,
    });
  });

  test("uninstall with sudo", async () => {
    await apt.uninstall(["jq"], { sudo: true });
    expect(exec).toHaveBeenCalledWith(
      "sudo",
      ["apt-get", "remove", "--yes", "jq"],
      { env },
    );
  });
});

describe("YumPackageManager", () => {
  const yum = new YumPackageManager();

  test("install", async () => {
    await yum.install(["jq"]);
    expect(exec).toHaveBeenCalledWith("yum", [
      "install",
      "--assumeyes",
      "--setopt=install_weak_deps=False",
      "jq",
    ]);
  });

  test("install with sudo", async () => {
    await yum.install(["jq"], { sudo: true });
    expect(exec).toHaveBeenCalledWith("sudo", [
      "yum",
      "install",
      "--assumeyes",
      "--setopt=install_weak_deps=False",
      "jq",
    ]);
  });

  test("uninstall", async () => {
    await yum.uninstall(["jq"]);
    expect(exec).toHaveBeenCalledWith("yum", ["remove", "--assumeyes", "jq"]);
  });

  test("uninstall with sudo", async () => {
    await yum.uninstall(["jq"], { sudo: true });
    expect(exec).toHaveBeenCalledWith("sudo", [
      "yum",
      "remove",
      "--assumeyes",
      "jq",
    ]);
  });
});

describe("ZypperPackageManager", () => {
  const zypper = new ZypperPackageManager();

  test("install", async () => {
    await zypper.install(["jq"]);
    expect(exec).toHaveBeenCalledWith("zypper", [
      "install",
      "--no-confirm",
      "jq",
    ]);
  });

  test("install with sudo", async () => {
    await zypper.install(["jq"], { sudo: true });
    expect(exec).toHaveBeenCalledWith("sudo", [
      "zypper",
      "install",
      "--no-confirm",
      "jq",
    ]);
  });

  test("uninstall", async () => {
    await zypper.uninstall(["jq"]);
    expect(exec).toHaveBeenCalledWith("zypper", [
      "remove",
      "--no-confirm",
      "jq",
    ]);
  });

  test("uninstall with sudo", async () => {
    await zypper.uninstall(["jq"], { sudo: true });
    expect(exec).toHaveBeenCalledWith("sudo", [
      "zypper",
      "remove",
      "--no-confirm",
      "jq",
    ]);
  });
});
