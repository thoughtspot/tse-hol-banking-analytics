"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { AnswerTable, Cell, TableColumn } from "@/lib/thoughtspot/answer-table";
import { MAX_TABLE_ROWS } from "@/lib/thoughtspot/answer-table";

export type TableDialogState =
  | { status: "loading"; title: string }
  | { status: "error"; title: string; message: string }
  | { status: "ready"; title: string; table: AnswerTable };

type Sort = { column: number; direction: "asc" | "desc" };

const collator = new Intl.Collator("en-US", { numeric: true, sensitivity: "base" });
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});
const MS_PER_DAY = 86_400_000;

function compareCells(a: Cell, b: Cell): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

function sortRows(rows: Cell[][], sort: Sort | null): Cell[][] {
  if (!sort) return rows;
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = a[sort.column];
    const right = b[sort.column];
    // Empty values always sort last, in either direction.
    if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1;
    return factor * compareCells(left, right);
  });
}

function formatCell(cell: Cell, column: TableColumn, showTime: boolean): string {
  if (cell === null) return "";
  if (column.kind === "date" && typeof cell === "number") {
    return (showTime ? dateTimeFormat : dateFormat).format(cell);
  }
  if (typeof cell === "number") return numberFormat.format(cell);
  return cell;
}

function DataTable({ table }: { table: AnswerTable }) {
  const [sort, setSort] = useState<Sort | null>(null);
  const rows = useMemo(() => sortRows(table.rows, sort), [table.rows, sort]);
  const showTime = useMemo(
    () =>
      table.columns.map(
        (column, index) =>
          column.kind === "date" &&
          table.rows.some((row) => typeof row[index] === "number" && (row[index] as number) % MS_PER_DAY !== 0),
      ),
    [table],
  );

  function toggleSort(column: number) {
    setSort((current) =>
      current?.column === column
        ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" },
    );
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr>
              {table.columns.map((column, index) => {
                const active = sort?.column === index;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                    className={`border-b border-slate-200 p-0 font-semibold ${column.kind === "number" ? "text-right" : "text-left"}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(index)}
                      className={`w-full cursor-pointer px-4 py-2.5 hover:text-brand-600 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 ${column.kind === "number" ? "text-right" : "text-left"}`}
                    >
                      {column.name}
                      <span aria-hidden="true" className="ml-1 inline-block w-3 text-xs text-muted">
                        {active ? (sort.direction === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100 odd:bg-white even:bg-brand-50/40">
                {table.columns.map((column, index) => (
                  <td
                    key={column.id}
                    className={`px-4 py-2 ${column.kind === "number" ? "text-right tabular-nums" : "text-left"}`}
                  >
                    {formatCell(row[index], column, showTime[index])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-200 px-5 py-2.5 text-xs text-muted">
        {table.truncated ? `First ${MAX_TABLE_ROWS} rows` : `${table.rows.length} ${table.rows.length === 1 ? "row" : "rows"}`}
      </p>
    </>
  );
}

/**
 * A native modal dialog, opened as soon as it mounts. Escape, the × button and
 * a click on the backdrop all close it; `onClose` runs for every way of closing.
 */
export default function TableDialog({
  state,
  onClose,
}: {
  state: TableDialogState;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // The dialog has no padding, so a click on the dialog element itself is a click on the backdrop.
    if (event.target === event.currentTarget) event.currentTarget.close();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="table-dialog-title"
      className="m-auto w-[min(64rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-slate-900/50"
    >
      <div className="flex max-h-[85vh] min-h-48 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <h2 id="table-dialog-title" className="min-w-0 truncate font-semibold">
            {state.title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-xl leading-none text-muted hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            ×
          </button>
        </header>
        {state.status === "loading" && (
          <p role="status" aria-busy="true" className="grid flex-1 place-items-center p-10 text-sm text-muted">
            Loading table…
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="grid flex-1 place-items-center p-10 text-sm text-muted">
            {state.message}
          </p>
        )}
        {state.status === "ready" && <DataTable table={state.table} />}
      </div>
    </dialog>
  );
}
