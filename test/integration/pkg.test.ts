import child_process from "node:child_process";
import util from "node:util";
import { describe, expect, test } from "vitest";
import { pkg } from "../../src/index";

const exec = util.promisify(child_process.exec);

describe("pkg", () => {
  test("install", async () => {
    await pkg.install(["jq"]);

    const { stdout } = await exec("jq --version");

    expect(stdout).toContain("jq-");

    await pkg.uninstall(["jq"]);

    expect(() => exec("jq --version")).rejects.toThrow();
  });
});
