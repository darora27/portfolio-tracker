import { describe, expect, it } from "vitest";
import { isValidSession, sessionToken } from "./auth";

describe("sessionToken", () => {
  it("is deterministic for the same password", () => {
    expect(sessionToken("hunter2")).toBe(sessionToken("hunter2"));
  });

  it("differs for different passwords", () => {
    expect(sessionToken("hunter2")).not.toBe(sessionToken("hunter3"));
  });
});

describe("isValidSession", () => {
  it("accepts the correct token for the configured password", () => {
    const token = sessionToken("correct-horse-battery-staple");
    expect(isValidSession(token, "correct-horse-battery-staple")).toBe(true);
  });

  it("rejects a token generated from the wrong password", () => {
    const token = sessionToken("wrong-password");
    expect(isValidSession(token, "correct-horse-battery-staple")).toBe(false);
  });

  it("rejects an absent cookie", () => {
    expect(isValidSession(undefined, "correct-horse-battery-staple")).toBe(false);
  });

  it("rejects garbage input without throwing", () => {
    expect(isValidSession("not-even-hex", "correct-horse-battery-staple")).toBe(false);
    expect(isValidSession("", "correct-horse-battery-staple")).toBe(false);
  });
});
