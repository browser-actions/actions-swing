import { describe, expect, test } from "vitest";
import { install } from "../../src/pkg/index";

describe("pkg", () => {
  test("install", async () => {
    const result = await install();
    expect(result).toBe(0xdeadbeef);
  });
});
