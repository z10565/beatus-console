"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchSelectOption = {
  id: string;
  label: string;
  sublabel?: string;
};

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
}: {
  options: SearchSelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 20);
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20);
  }, [options, query]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
      >
        <span className={cn(!selected && "text-muted-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <Input
        autoFocus
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      <div className="max-h-56 overflow-y-auto rounded-md border bg-popover shadow-md">
        {filtered.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">No matches.</div>
        )}
        {filtered.map((option) => (
          <button
            key={option.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange(option.id);
              setQuery("");
              setOpen(false);
            }}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
          >
            <div>
              <div>{option.label}</div>
              {option.sublabel && (
                <div className="text-xs text-muted-foreground">{option.sublabel}</div>
              )}
            </div>
            {option.id === value && <Check className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
