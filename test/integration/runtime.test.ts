import { describe, expect, test } from "vitest";
import { runtime } from "../../src/index";

describe("runtime", () => {
  test("get os-releae id", async () => {
    const osReleaseId = await runtime.getOsReleaseId();

    expect(osReleaseId).oneOf([
      "rhel",
      "centos",
      "ol",
      "fedora",
      "debian",
      "ubuntu",
      "linuxmint",
      "opensuse-leap",
      "sles",
    ]);
  });
});
