import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { loadOsRelease } from "../../src/runtime/index";

describe("loadOsRelease", () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "os-release-"));
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true });
  });

  test.each([
    { id: "rhel", idLike: "fedora", versionId: "9.3" },
    { id: "centos", idLike: "rhel fedora", versionId: "8" },
    { id: "ol", idLike: "fedora", versionId: "9.3" },
    { id: "fedora", idLike: undefined, versionId: "39" },
    { id: "debian", idLike: undefined, versionId: "12" },
    { id: "ubuntu", idLike: "debian", versionId: "22.04" },
    { id: "linuxmint", idLike: "ubuntu", versionId: "21" },
    { id: "opensuse-leap", idLike: "suse opensuse", versionId: "15.5" },
    { id: "sles", idLike: "suse", versionId: "15.5" },
  ])("should load os-release for $id", async ({ id, idLike, versionId }) => {
    const p = path.join(__dirname, "fixtures", `os-release.${id}`);
    const osRelease = await loadOsRelease(p);
    expect(osRelease.ID).toBe(id);
    expect(osRelease.ID_LIKE).toBe(idLike);
    expect(osRelease.VERSION_ID).toBe(versionId);
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
