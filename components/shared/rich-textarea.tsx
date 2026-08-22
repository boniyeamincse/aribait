"use client";

import { useRef } from "react";
import { Bold, Italic, Heading2, List, ListOrdered } from "lucide-react";

import { cn } from "@/lib/utils";

const TEXTAREA_CLASS =
  "flex field-sizing-content min-h-16 w-full rounded-b-lg rounded-t-none border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm";

type ToolbarAction = {
  icon: typeof Bold;
  label: string;
  apply: (el: HTMLTextAreaElement) => void;
};

function wrapSelection(el: HTMLTextAreaElement, marker: string) {
  const { selectionStart, selectionEnd, value } = el;
  const selected = value.slice(selectionStart, selectionEnd);
  el.value = value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd);
  el.focus();
  const cursor = selected ? selectionStart + marker.length + selected.length + marker.length : selectionStart + marker.length;
  el.setSelectionRange(cursor, cursor);
}

function prefixLine(el: HTMLTextAreaElement, marker: string) {
  const { selectionStart, value } = el;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  el.value = value.slice(0, lineStart) + marker + value.slice(lineStart);
  el.focus();
  const cursor = selectionStart + marker.length;
  el.setSelectionRange(cursor, cursor);
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", apply: (el) => wrapSelection(el, "**") },
  { icon: Italic, label: "Italic", apply: (el) => wrapSelection(el, "*") },
  { icon: Heading2, label: "Heading", apply: (el) => prefixLine(el, "## ") },
  { icon: List, label: "Bullet list", apply: (el) => prefixLine(el, "- ") },
  { icon: ListOrdered, label: "Numbered list", apply: (el) => prefixLine(el, "1. ") },
];

/** Plain-text textarea with a formatting toolbar that inserts a small,
 * hand-rolled Markdown subset (bold/italic/heading/bullet+numbered lists) —
 * rendered back out by components/shared/markdown-content.tsx. No rich-text
 * editor dependency: the textarea stays a genuinely uncontrolled DOM node
 * (matches every other field in these forms), the toolbar just mutates
 * el.value directly via ref, same technique as any imperative textarea edit. */
export function RichTextarea({
  id,
  name,
  required,
  minLength,
  rows = 6,
  defaultValue,
  className,
}: {
  id: string;
  name: string;
  required?: boolean;
  minLength?: number;
  rows?: number;
  defaultValue?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-input bg-slate-50 p-1.5">
        {TOOLBAR_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              title={action.label}
              aria-label={action.label}
              onClick={() => ref.current && action.apply(ref.current)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
      <textarea
        ref={ref}
        id={id}
        name={name}
        required={required}
        minLength={minLength}
        rows={rows}
        defaultValue={defaultValue}
        className={cn(TEXTAREA_CLASS, className)}
      />
      <p className="text-xs text-slate-500">
        Supports <code>**bold**</code>, <code>*italic*</code>, <code>## Heading</code>, and{" "}
        <code>-</code> / <code>1.</code> lists.
      </p>
    </div>
  );
}
