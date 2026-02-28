"use client";

import React, { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FRRItem = Record<string, any>;

interface FRRPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

function extractFRRItems(data: Record<string, unknown>): FRRItem[] {
  if (Array.isArray(data)) return data as FRRItem[];

  // Try known keys
  for (const key of ["requirements", "frr", "recommendations", "controls"]) {
    const val = data[key];
    if (Array.isArray(val)) return val;
    if (val && typeof val === "object") {
      return Object.entries(val).map(([k, v]) => ({
        id: k,
        ...(typeof v === "object" ? (v as object) : { description: v }),
      }));
    }
  }

  // Search for key containing "req" or "frr"
  for (const key of Object.keys(data)) {
    if (key.toLowerCase().includes("req") || key.toLowerCase().includes("frr")) {
      const val = data[key];
      if (Array.isArray(val)) return val;
      if (val && typeof val === "object") {
        return Object.entries(val as Record<string, unknown>).map(([k, v]) => ({
          id: k,
          ...(typeof v === "object" ? (v as object) : {}),
        }));
      }
    }
  }
  return [];
}

function typeBadge(type: string) {
  const t = type?.toLowerCase();
  if (t === "requirement") return "bg-red-100 text-red-700";
  if (t === "recommendation") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

export default function FRRPanel({ data }: FRRPanelProps) {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const items = extractFRRItems(data);

  // Group by process or category
  const groups: Record<string, FRRItem[]> = {};
  for (const item of items) {
    const group = item.process ?? item.category ?? item.domain ?? "General";
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
  }

  const filteredGroups: Record<string, FRRItem[]> = {};
  for (const [g, gItems] of Object.entries(groups)) {
    const filtered = gItems.filter((item) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        String(item.id ?? "").toLowerCase().includes(s) ||
        String(item.name ?? "").toLowerCase().includes(s) ||
        String(item.description ?? "").toLowerCase().includes(s) ||
        String(item.statement ?? "").toLowerCase().includes(s)
      );
    });
    if (filtered.length > 0) filteredGroups[g] = filtered;
  }

  if (items.length === 0) {
    return (
      <div className="text-slate-400 text-sm">
        No FedRAMP Requirements and Recommendations data found in this document.
      </div>
    );
  }

  function toggle(g: string) {
    setOpenGroups((prev) => ({ ...prev, [g]: !prev[g] }));
  }

  const groupKeys = Object.keys(filteredGroups);

  return (
    <div>
      <input
        type="text"
        placeholder="Search requirements…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <div className="space-y-3">
        {groupKeys.map((g) => {
          const isOpen = openGroups[g] !== false; // default open
          return (
            <div key={g} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggle(g)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition"
              >
                <span className="font-semibold text-slate-800 text-sm">{g}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{filteredGroups[g].length} items</span>
                  <span className="text-slate-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {filteredGroups[g].map((item, i) => (
                    <div key={item.id ?? i} className="px-5 py-3">
                      <div className="flex items-start gap-2 mb-1">
                        {item.id && (
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded whitespace-nowrap">
                            {item.id}
                          </span>
                        )}
                        {item.type && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge(item.type)}`}>
                            {item.type}
                          </span>
                        )}
                        {(item.name ?? item.title) && (
                          <span className="font-medium text-slate-800 text-sm">{item.name ?? item.title}</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {item.description ?? item.statement ?? ""}
                      </p>
                      {item.rationale && (
                        <p className="text-slate-400 text-xs mt-1 italic">{item.rationale}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {groupKeys.length === 0 && (
          <p className="text-slate-400 text-sm">No requirements match your search.</p>
        )}
      </div>
    </div>
  );
}
