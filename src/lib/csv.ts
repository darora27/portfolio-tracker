/**
 * RFC-4180 field quoting: wrap in double quotes and double any embedded
 * quotes whenever a field contains a comma, quote, or newline. Plain
 * fields pass through unquoted.
 */
export function csvField(value: string | number | null): string {
  const str = value === null ? "" : String(value);
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
