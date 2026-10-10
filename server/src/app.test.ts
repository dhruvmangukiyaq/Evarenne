import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";

describe("createApp", () => {
  it("creates an express app with a health route", async () => {
    const app = createApp();
    expect(typeof app).toBe("function");
    expect(typeof app.listen).toBe("function");
  });
});
