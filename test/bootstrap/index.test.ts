import { describe, expect, test } from "vitest";
import { run } from "../../src/bootstrap/index";

describe("bootstrap", () => {
  test("run", async () => {
    const result = run();
    expect(result).toBe(42);
  });
});
