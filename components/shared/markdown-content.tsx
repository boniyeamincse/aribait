import type { ReactNode } from "react";

type Block =
  | { type: "heading"; lines: [string] }
  | { type: "ul" | "ol"; lines: string[] }
  | { type: "p"; lines: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  for (const line of lines) {
    if (line.trim() === "") {
      blocks.push({ type: "p", lines: [] });
      continue;
    }

    const headingMatch = /^##\s+(.*)$/.exec(line);
    if (headingMatch) {
      blocks.push({ type: "heading", lines: [headingMatch[1]] });
      continue;
    }

    const bulletMatch = /^[-*]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.lines.push(bulletMatch[1]);
      else blocks.push({ type: "ul", lines: [bulletMatch[1]] });
      continue;
    }

    const numberedMatch = /^\d+\.\s+(.*)$/.exec(line);
    if (numberedMatch) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "ol") last.lines.push(numberedMatch[1]);
      else blocks.push({ type: "ol", lines: [numberedMatch[1]] });
      continue;
    }

    const last = blocks[blocks.length - 1];
    if (last?.type === "p" && last.lines.length > 0) last.lines.push(line);
    else blocks.push({ type: "p", lines: [line] });
  }

  return blocks.filter((b) => b.lines.length > 0);
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${i++}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-i-${i++}`}>{match[2]}</em>);
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** Renders the small Markdown subset the toolbar in
 * components/shared/rich-textarea.tsx writes: **bold**, *italic*,
 * ## headings, and - / 1. lists. Hand-rolled on purpose — the supported
 * syntax is intentionally narrow, so a real Markdown/HTML library (and the
 * XSS surface dangerouslySetInnerHTML would open) isn't worth it. */
export function MarkdownContent({ text, className }: { text: string; className?: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const key = `block-${i}`;
        if (block.type === "heading") {
          return (
            <h3 key={key} className="mb-2 mt-4 text-lg font-bold text-slate-900 first:mt-0">
              {renderInline(block.lines[0], key)}
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={key} className="mb-4 list-disc space-y-1 pl-5 last:mb-0">
              {block.lines.map((line, j) => (
                <li key={`${key}-${j}`}>{renderInline(line, `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={key} className="mb-4 list-decimal space-y-1 pl-5 last:mb-0">
              {block.lines.map((line, j) => (
                <li key={`${key}-${j}`}>{renderInline(line, `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={key} className="mb-4 leading-relaxed last:mb-0">
            {block.lines.map((line, j) => (
              <span key={`${key}-${j}`}>
                {j > 0 && <br />}
                {renderInline(line, `${key}-${j}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
