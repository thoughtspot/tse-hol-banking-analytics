/**
 * Turns the data shapes ThoughtSpot hands back for a visualization into one
 * simple table. Pure and dependency free so it runs in the browser, on the
 * server, and in the plain node check script.
 */

/** Rows shown in the table; one extra row is requested to know whether there are more. */
export const MAX_TABLE_ROWS = 100;
export const FETCH_TABLE_ROWS = MAX_TABLE_ROWS + 1;

const MS_PER_SECOND = 1000;

export type ColumnKind = "number" | "date" | "text";

/** Numbers stay numbers, date buckets become epoch milliseconds, everything else is text. */
export type Cell = string | number | null;

export type TableColumn = { id: string; name: string; kind: ColumnKind };

export type AnswerTable = {
  columns: TableColumn[];
  rows: Cell[][];
  /** True when the source had more than MAX_TABLE_ROWS rows. */
  truncated: boolean;
};

export type ParseResult =
  | { ok: true; table: AnswerTable }
  | { ok: false; reason: "empty" | "unrecognized" };

type Series = { columnId: string | undefined; values: unknown[] };

/** A date bucket is `{ v: { s: <epoch seconds> } }`. */
type DateBucket = { v: { s: number } };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateBucket(value: unknown): value is DateBucket {
  return (
    isRecord(value) &&
    isRecord(value.v) &&
    typeof value.v.s === "number" &&
    Number.isFinite(value.v.s)
  );
}

function isColumnarEntry(value: unknown): value is { columnDataLite: unknown[] } {
  return isRecord(value) && Array.isArray(value.columnDataLite);
}

function normalizeCell(value: unknown): Cell {
  if (value === null || value === undefined || value === "") return null;
  if (isDateBucket(value)) return value.v.s * MS_PER_SECOND;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function columnKind(values: unknown[], cells: Cell[]): ColumnKind {
  const present = values.filter((v) => v !== null && v !== undefined && v !== "");
  if (present.length === 0) return "text";
  if (present.every(isDateBucket)) return "date";
  if (cells.every((c) => c === null || typeof c === "number") && present.every((v) => typeof v === "number")) {
    return "number";
  }
  return "text";
}

type ColumnMeta = { id: string | undefined; name: string | undefined };

function readColumnMeta(column: unknown): ColumnMeta {
  if (typeof column === "string") return { id: undefined, name: column };
  if (!isRecord(column)) return { id: undefined, name: undefined };
  const inner = isRecord(column.column) ? column.column : column;
  const id = typeof inner.id === "string" ? inner.id : undefined;
  const name = typeof inner.name === "string" ? inner.name : undefined;
  return { id, name };
}

function buildTable(
  parts: { id: string; name: string; values: unknown[] }[],
): ParseResult {
  const rowCount = Math.max(0, ...parts.map((p) => p.values.length));
  if (rowCount === 0) return { ok: false, reason: "empty" };

  const columns: TableColumn[] = [];
  const cellColumns: Cell[][] = [];
  for (const part of parts) {
    const cells = part.values.map(normalizeCell);
    columns.push({ id: part.id, name: part.name, kind: columnKind(part.values, cells) });
    cellColumns.push(cells);
  }

  const visibleRows = Math.min(rowCount, MAX_TABLE_ROWS);
  const rows: Cell[][] = [];
  for (let r = 0; r < visibleRows; r += 1) {
    rows.push(cellColumns.map((cells) => cells[r] ?? null));
  }
  return { ok: true, table: { columns, rows, truncated: rowCount > MAX_TABLE_ROWS } };
}

function collectSeries(entries: unknown[]): Series[] {
  const byKey = new Map<string, Series>();
  const ordered: Series[] = [];
  for (const entry of entries) {
    if (!isColumnarEntry(entry)) continue;
    entry.columnDataLite.forEach((raw, index) => {
      if (!isRecord(raw) || !Array.isArray(raw.dataValue)) return;
      const columnId = typeof raw.columnId === "string" ? raw.columnId : undefined;
      const key = columnId ?? `#${index}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.values.push(...raw.dataValue);
        return;
      }
      const series: Series = { columnId, values: [...raw.dataValue] };
      byKey.set(key, series);
      ordered.push(series);
    });
  }
  return ordered;
}

/**
 * Columns can outnumber the data series (hidden columns have no series), so
 * only columns that have values are kept. A series matches its column by id,
 * falling back to position when the series carries no known id.
 */
function parseColumnar(columns: unknown[], entries: unknown[]): ParseResult {
  const series = collectSeries(entries);
  const metas = columns.map(readColumnMeta);
  const knownIds = new Set(metas.flatMap((m) => (m.id ? [m.id] : [])));
  const byId = new Map(series.flatMap((s) => (s.columnId ? [[s.columnId, s] as const] : [])));

  const parts: { id: string; name: string; values: unknown[] }[] = [];
  metas.forEach((meta, index) => {
    let match = meta.id ? byId.get(meta.id) : undefined;
    if (!match) {
      const positional = series[index];
      if (positional && (!positional.columnId || !knownIds.has(positional.columnId))) {
        match = positional;
      }
    }
    if (!match || match.values.length === 0) return;
    parts.push({
      id: meta.id ?? match.columnId ?? `col-${index}`,
      name: meta.name ?? `Column ${index + 1}`,
      values: match.values,
    });
  });

  // No column metadata at all: fall back to the series themselves.
  if (metas.length === 0) {
    series.forEach((s, index) => {
      if (s.values.length === 0) return;
      parts.push({ id: s.columnId ?? `col-${index}`, name: `Column ${index + 1}`, values: s.values });
    });
  }
  return buildTable(parts);
}

function parseRowArrays(names: unknown[], rows: unknown[][]): ParseResult {
  const width = Math.max(0, ...rows.map((r) => r.length));
  if (width === 0) return { ok: false, reason: "empty" };
  const parts = Array.from({ length: width }, (_, index) => ({
    id: `col-${index}`,
    name: readColumnMeta(names[index]).name ?? `Column ${index + 1}`,
    values: rows.map((row) => row[index]),
  }));
  return buildTable(parts);
}

/**
 * Accepts `{ columns, data }` (answer data, columnar wrapped or unwrapped, or
 * plain row arrays), REST `{ column_names, data_rows }`, or a bare row array.
 * Anything else is rejected as "unrecognized"; a recognized shape without rows
 * is "empty".
 */
export function parseAnswerData(source: unknown): ParseResult {
  if (Array.isArray(source)) {
    return source.every(Array.isArray)
      ? parseRowArrays([], source as unknown[][])
      : { ok: false, reason: "unrecognized" };
  }
  if (!isRecord(source)) return { ok: false, reason: "unrecognized" };

  if (Array.isArray(source.data_rows)) {
    const names = Array.isArray(source.column_names) ? source.column_names : [];
    return source.data_rows.every(Array.isArray)
      ? parseRowArrays(names, source.data_rows as unknown[][])
      : { ok: false, reason: "unrecognized" };
  }

  const { columns, data } = source;
  if (!Array.isArray(columns)) return { ok: false, reason: "unrecognized" };

  if (isColumnarEntry(data)) return parseColumnar(columns, [data]);
  if (Array.isArray(data)) {
    if (data.length === 0) return { ok: false, reason: "empty" };
    if (data.every(isColumnarEntry)) return parseColumnar(columns, data);
    if (data.every(Array.isArray)) return parseRowArrays(columns, data as unknown[][]);
  }
  return { ok: false, reason: "unrecognized" };
}

/**
 * Describes the structure of a payload for logs: field names and list lengths
 * only, never values.
 */
export function describeShape(value: unknown, depth = 0): string {
  const MAX_DEPTH = 4;
  if (Array.isArray(value)) {
    const first = value.length > 0 && depth < MAX_DEPTH ? `<${describeShape(value[0], depth + 1)}>` : "";
    return `list(${value.length})${first}`;
  }
  if (isRecord(value)) {
    if (depth >= MAX_DEPTH) return "object";
    const fields = Object.keys(value).map((key) => `${key}:${describeShape(value[key], depth + 1)}`);
    return `{${fields.join(",")}}`;
  }
  return value === null ? "null" : typeof value;
}
