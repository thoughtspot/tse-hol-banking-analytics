import type { ReactNode } from "react";
import { thoughtSpotHost } from "@/lib/thoughtspot/host";

/**
 * Renders Markdown from the model and from ThoughtSpot tool replies.
 *
 * Safe by construction: the output is built only from React elements and text
 * nodes, so raw HTML in the source is shown as literal text, never parsed.
 * Banksy users have no access to ThoughtSpot, so links are never rendered:
 * a link shows its label as plain text, images show their alt text, and any
 * URL on the ThoughtSpot host is removed.
 */

const HEADING_CLASSES = [
  "text-base font-semibold",
  "text-base font-semibold",
  "text-sm font-semibold",
  "text-sm font-semibold",
  "text-sm font-medium",
  "text-sm font-medium",
] as const;

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^\s{0,3}>\s?/;
const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

// Order matters: code spans win over emphasis, links over everything else.
const INLINE =
  /`([^`]+)`|!\[([^\]]*)\]\([^)]*\)|\[([^\]]+)\]\([^)]*\)|\*\*(.+?)\*\*|__(.+?)__|~~(.+?)~~|\*(?![\s*])(.+?)(?<![\s*])\*|(?<![A-Za-z0-9])_(?![\s_])(.+?)(?<![\s_])_(?![A-Za-z0-9])/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function thoughtSpotUrlPattern(): RegExp | undefined {
  const host = thoughtSpotHost(process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST);
  if (!host) return undefined;
  return new RegExp(`https?://${escapeRegExp(host)}[^\\s)>\\]"']*`, "gi");
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}-${index++}`;
    const [, code, imageAlt, linkLabel, bold, boldAlt, strike, italic, italicAlt] = match;
    if (code !== undefined) {
      nodes.push(
        <code key={key} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">
          {code}
        </code>,
      );
    } else if (imageAlt !== undefined) {
      if (imageAlt) nodes.push(imageAlt);
    } else if (linkLabel !== undefined) {
      nodes.push(...renderInline(linkLabel, key));
    } else if (bold !== undefined || boldAlt !== undefined) {
      nodes.push(<strong key={key}>{renderInline(bold ?? boldAlt, key)}</strong>);
    } else if (strike !== undefined) {
      nodes.push(<del key={key}>{renderInline(strike, key)}</del>);
    } else if (italic !== undefined || italicAlt !== undefined) {
      nodes.push(<em key={key}>{renderInline(italic ?? italicAlt, key)}</em>);
    }
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type ListItem = { indent: number; ordered: boolean; text: string };

function renderList(items: ListItem[], keyPrefix: string): ReactNode {
  function build(from: number, indent: number, key: string): [ReactNode, number] {
    const ordered = items[from].ordered;
    const children: ReactNode[] = [];
    let i = from;
    while (i < items.length && items[i].indent >= indent) {
      if (items[i].indent > indent) {
        // A deeper item belongs to the previous item.
        const [nested, next] = build(i, items[i].indent, `${key}-n${i}`);
        children.push(nested);
        i = next;
        continue;
      }
      children.push(<li key={`${key}-${i}`}>{renderInline(items[i].text, `${key}-${i}`)}</li>);
      i += 1;
    }
    const List = ordered ? "ol" : "ul";
    const className = ordered ? "list-decimal space-y-0.5 pl-5" : "list-disc space-y-0.5 pl-5";
    return [
      <List key={key} className={className}>
        {children}
      </List>,
      i,
    ];
  }
  return build(0, items[0].indent, keyPrefix)[0];
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function alignment(cell: string): "left" | "right" | "center" {
  const starts = cell.startsWith(":");
  const ends = cell.endsWith(":");
  if (starts && ends) return "center";
  return ends ? "right" : "left";
}

function renderBlocks(source: string, keyPrefix: string): ReactNode[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let n = 0;

  const isBlockStart = (line: string, next: string | undefined) =>
    FENCE.test(line) ||
    HEADING.test(line) ||
    RULE.test(line) ||
    QUOTE.test(line) ||
    LIST_ITEM.test(line) ||
    (line.includes("|") && next !== undefined && TABLE_SEPARATOR.test(next) && next.includes("-"));

  while (i < lines.length) {
    const line = lines[i];
    const key = `${keyPrefix}-${n++}`;

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence (or end of a still-streaming block)
      blocks.push(
        <pre
          key={key}
          className="overflow-x-auto rounded-lg bg-navy-900 p-3 font-mono text-xs text-white"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${level}` as "h1";
      blocks.push(
        <Tag key={key} className={HEADING_CLASSES[level - 1]}>
          {renderInline(heading[2], key)}
        </Tag>,
      );
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push(<hr key={key} className="border-slate-200" />);
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        quoted.push(lines[i].replace(QUOTE, ""));
        i += 1;
      }
      blocks.push(
        <blockquote key={key} className="space-y-2 border-l-2 border-slate-300 pl-3 text-muted">
          {renderBlocks(quoted.join("\n"), key)}
        </blockquote>,
      );
      continue;
    }

    const next = lines[i + 1];
    if (line.includes("|") && next !== undefined && TABLE_SEPARATOR.test(next) && next.includes("-")) {
      const header = splitRow(line);
      const aligns = splitRow(next).map(alignment);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      const alignClass = (col: number) =>
        aligns[col] === "right" ? "text-right" : aligns[col] === "center" ? "text-center" : "text-left";
      blocks.push(
        <div key={key} className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {header.map((cell, col) => (
                  <th
                    key={col}
                    className={`border-b border-slate-300 px-2 py-1 font-semibold ${alignClass(col)}`}
                  >
                    {renderInline(cell, `${key}-h${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} className="border-b border-slate-100">
                  {header.map((_, col) => (
                    <td key={col} className={`px-2 py-1 ${alignClass(col)}`}>
                      {renderInline(row[col] ?? "", `${key}-${r}-${col}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (LIST_ITEM.test(line)) {
      const items: ListItem[] = [];
      while (i < lines.length) {
        const match = LIST_ITEM.exec(lines[i]);
        if (match) {
          items.push({
            indent: match[1].replace(/\t/g, "    ").length,
            ordered: /\d/.test(match[2]),
            text: match[3],
          });
        } else if (lines[i].trim() && /^\s+\S/.test(lines[i]) && items.length > 0) {
          items[items.length - 1].text += ` ${lines[i].trim()}`; // lazy continuation
        } else {
          break;
        }
        i += 1;
      }
      blocks.push(renderList(items, key));
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && (paragraph.length === 0 || !isBlockStart(lines[i], lines[i + 1]))) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push(<p key={key}>{renderInline(paragraph.join(" "), key)}</p>);
  }
  return blocks;
}

export default function Markdown({ source }: { source: string }) {
  const urlPattern = thoughtSpotUrlPattern();
  const safeSource = urlPattern ? source.replace(urlPattern, "") : source;
  return <div className="space-y-2 break-words">{renderBlocks(safeSource, "md")}</div>;
}
