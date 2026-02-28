"use client";

import React, { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefItem = Record<string, any>;

interface FRDPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

function extractDefinitions(data: Record<string, unknown>): DefItem[] {
  if (Array.isArray(data)) return data as DefItem[];

  for (const key of ["definitions", "glossary", "terms", "frd"]) {
    const val = data[key];
    if (Array.isArray(val)) return val;
    if (val && typeof val === "object") {
      return Object.entries(val).map(([k, v]) => ({
        id: k,
        term: k,
        ...(typeof v === "object" ? (v as object) : { definition: v }),
      }));
    }
  }

  // Search for key containing "def" or "frd" or "gloss"
  for (const key of Object.keys(data)) {
    if (
      key.toLowerCase().includes("def") ||
      key.toLowerCase().includes("frd") ||
      key.toLowerCase().includes("gloss")
    ) {
      const val = data[key];
      if (Array.isArray(val)) return val;
      if (val && typeof val === "object") {
        return Object.entries(val as Record<string, unknown>).map(([k, v]) => ({
          id: k,
          term: k,
          ...(typeof v === "object" ? (v as object) : { definition: v }),
        }));
      }
    }
  }
  return [];
}

export default function FRDPanel({ data }: FRDPanelProps) {
  const [search, setSearch] = useState("");

  const defs = extractDefinitions(data);

  const filtered = defs.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      String(d.term ?? d.name ?? d.id ?? "").toLowerCase().includes(s) ||
      String(d.definition ?? d.description ?? "").toLowerCase().includes(s)
    );
  });

  if (defs.length === 0) {
    return (
      <div className="text-slate-400 text-sm">
        No definitions or glossary data found in this document.
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search definitions…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <div className="space-y-2">
        {filtered.map((def, i) => (
          <div key={def.id ?? i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-start gap-3">
              {def.id && def.id !== (def.term ?? def.name) && (
                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded whitespace-nowrap mt-0.5">
                  {def.id}
                </span>
              )}
              <div>
                <span className="font-semibold text-slate-800 text-sm">
                  {def.term ?? def.name ?? def.id}
                </span>
                <p className="text-slate-500 text-xs leading-relaxed mt-0.5">
                  {def.definition ?? def.description ?? ""}
                </p>
                {def.source && (
                  <span className="text-xs text-slate-400 mt-0.5 block">Source: {def.source}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-400 text-sm">No definitions match your search.</p>
        )}
      </div>
    </div>
  );
}
