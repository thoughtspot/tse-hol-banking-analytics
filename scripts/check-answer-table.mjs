// Run with: node scripts/check-answer-table.mjs
import assert from "node:assert/strict";
import {
  FETCH_TABLE_ROWS,
  MAX_TABLE_ROWS,
  parseAnswerData,
} from "../lib/thoughtspot/answer-table.ts";

function table(source) {
  const result = parseAnswerData(source);
  assert.equal(result.ok, true, `expected a table, got ${JSON.stringify(result)}`);
  return result.table;
}

const columns = [
  { column: { id: "a", name: "Region" } },
  { column: { id: "b", name: "Sales" } },
  { column: { id: "c", name: "Month" } },
];
const series = [
  { columnId: "a", dataValue: ["East", "West"] },
  { columnId: "b", dataValue: [10, 20] },
  { columnId: "c", dataValue: [{ v: { s: 1700000000 } }, { v: { s: 1702592000 } }] },
];

// Columnar, wrapped in an array.
let t = table({ columns, data: [{ columnDataLite: series }] });
assert.deepEqual(t.columns.map((c) => [c.name, c.kind]), [
  ["Region", "text"],
  ["Sales", "number"],
  ["Month", "date"],
]);
assert.deepEqual(t.rows[0], ["East", 10, 1700000000 * 1000]);
assert.equal(t.truncated, false);

// Columnar, not wrapped in an array; values matched by columnId, not order.
t = table({ columns, data: { columnDataLite: [series[1], series[0]] } });
assert.deepEqual(t.rows[1].slice(0, 2), ["West", 20]);

// More columns than data series: hidden columns are dropped, not an error.
const six = [...columns, ...["d", "e", "f"].map((id) => ({ column: { id, name: id } }))];
t = table({ columns: six, data: [{ columnDataLite: series.slice(0, 2) }] });
assert.deepEqual(t.columns.map((c) => c.name), ["Region", "Sales"]);

// Series without ids fall back to position.
t = table({
  columns,
  data: [{ columnDataLite: series.map(({ dataValue }) => ({ dataValue })) }],
});
assert.equal(t.columns.length, 3);

// Plain row arrays, with empty values normalized to null.
t = table({ columns: ["Name", "Count"], data: [["a", 1], ["b", ""]] });
assert.deepEqual(t.rows, [["a", 1], ["b", null]]);
assert.equal(t.columns[1].kind, "number");

// The row cap: 101 rows in, 100 shown, truncated.
const many = Array.from({ length: FETCH_TABLE_ROWS }, (_, i) => [i]);
t = table({ columns: ["n"], data: many });
assert.equal(t.rows.length, MAX_TABLE_ROWS);
assert.equal(t.truncated, true);
assert.equal(table({ columns: ["n"], data: many.slice(0, MAX_TABLE_ROWS) }).truncated, false);

// Unknown shapes are rejected; known shapes without rows are "empty".
for (const bad of [null, undefined, 5, "x", {}, { columns, data: "nope" }, { columns, data: [1, 2] }]) {
  assert.deepEqual(parseAnswerData(bad), { ok: false, reason: "unrecognized" });
}
assert.deepEqual(parseAnswerData({ columns, data: [] }), { ok: false, reason: "empty" });
assert.deepEqual(
  parseAnswerData({ columns, data: [{ columnDataLite: [{ columnId: "a", dataValue: [] }] }] }),
  { ok: false, reason: "empty" },
);

console.log("answer-table checks passed");
