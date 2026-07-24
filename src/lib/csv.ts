// A leading =, +, -, @, tab, or CR makes Excel/Sheets/Numbers interpret a
// cell as a formula on open. Free-text fields (e.g. a trade's `reason`)
// are user-supplied, so prefix a leading apostrophe to force text
// interpretation — matches the field's own visible value, just neutralized.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

/**
 * RFC-4180 field quoting: wrap in double quotes and double any embedded
 * quotes whenever a field contains a comma, quote, or newline. Plain
 * fields pass through unquoted. Guards against CSV/formula injection for
 * values that would otherwise open as a spreadsheet formula.
 */
export function csvField(value: string | number | null): string {
  let str = value === null ? "" : String(value);
  if (FORMULA_TRIGGER.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Builds a full CSV document (CRLF line endings per RFC-4180) from a header row and data rows. */
export function toCsv(header: string[], rows: (string | number | null)[][]): string {
  const lines = [header, ...rows].map((row) => row.map(csvField).join(","));
  return lines.join("\r\n") + "\r\n";
}
