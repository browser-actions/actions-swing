import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { loadOsRelease } from "../../src/pkg/distributions";

describe("loadOsRelease", () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "os-release-"));
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  test.each([
    { id: "rhel", idLike: "fedora" },
    { id: "centos", idLike: "rhel fedora" },
    { id: "ol", idLike: "fedora" },
    { id: "fedora", idLike: undefined },
    { id: "debian", idLike: undefined },
    { id: "ubuntu", idLike: "debian" },
    { id: "linuxmint", idLike: "ubuntu" },
    { id: "opensuse-leap", idLike: "suse opensuse" },
    { id: "sles", idLike: "suse" },
  ])("should load os-release for $id", async ({ id }) => {
    const p = path.join(__dirname, "fixtures", `os-release.${id}`);
    const osRelease = await loadOsRelease(p);
    expect(osRelease.ID).toBe(id);
  });

  test.each(["", `ID=""`, `NAME="Hello"`])(
    "should throw an error if the os-release is invalid",
    async (content) => {
      const p = path.join(tmpDir, "os-release");
      await fs.writeFile(p, content);

      expect(loadOsRelease(p)).rejects.toThrow();
    },
  );
});
