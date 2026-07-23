import { describe, expect, it } from "vitest";
import { csvField, toCsv } from "./csv";

describe("csvField", () => {
  it("passes plain values through unquoted", () => {
    expect(csvField("AAPL")).toBe("AAPL");
    expect(csvField(42.5)).toBe("42.5");
  });

  it("quotes a value containing a comma", () => {
    expect(csvField("100, buy")).toBe('"100, buy"');
  });

  it("quotes and doubles embedded quotes", () => {
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
  });

  it("quotes a value containing a newline", () => {
    expect(csvField("line1\nline2")).toBe('"line1\nline2"');
  });

  it("renders null as an empty field", () => {
    expect(csvField(null)).toBe("");
  });
});

describe("toCsv", () => {
  it("joins header and rows with CRLF line endings", () => {
    const csv = toCsv(
      ["Date", "Ticker", "Reason"],
      [
        ["2026-07-01", "AAPL", null],
        ["2026-07-02", "MSFT", "rebalance, quarterly"],
      ],
    );
    expect(csv).toBe(
      'Date,Ticker,Reason\r\n2026-07-01,AAPL,\r\n2026-07-02,MSFT,"rebalance, quarterly"\r\n',
    );
  });
});
