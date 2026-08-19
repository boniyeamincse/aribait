"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResultGroup } from "@/lib/search/actions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        const data = await globalSearch(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search events, students, transactions..."
          className="h-9 w-full bg-slate-100 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-slate-300 md:w-64 lg:w-80"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-slate-400" />
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg md:w-[400px]">
          {results.length === 0 && !loading ? (
            <p className="p-4 text-center text-sm text-slate-500">No results found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((group) => (
                <div key={group.label} className="flex flex-col">
                  <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {group.label}
                  </span>
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
                    >
                      <span className="font-medium text-slate-900">{item.title}</span>
                      {item.detail && (
                        <span className="text-xs text-slate-500">{item.detail}</span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
