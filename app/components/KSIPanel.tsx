"use client";

import React, { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KSIItem = Record<string, any>;

interface KSIPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "required") return "bg-red-100 text-red-700";
  if (s === "recommended") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

export default function KSIPanel({ data }: KSIPanelProps) {
  const [search, setSearch] = useState("");

  // FRMR format has KSI indicators at data.indicators or similar
  // Try several known locations
  const ksis: KSIItem[] = (() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.indicators)) return data.indicators;
    if (Array.isArray(data?.ksi)) return data.ksi;
    if (data?.key_security_indicators) {
      const ksi = data.key_security_indicators;
      if (Array.isArray(ksi)) return ksi;
      return Object.entries(ksi).map(([k, v]) => ({
        id: k,
        ...(typeof v === "object" ? (v as object) : { description: v }),
      }));
    }
    // Try to find KSI section from top-level FRMR doc
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (
        key.toLowerCase().includes("ksi") &&
        (Array.isArray(val) || typeof val === "object")
      ) {
        if (Array.isArray(val)) return val;
        return Object.entries(val).map(([k, v]) => ({
          id: k,
          ...(typeof v === "object" ? (v as object) : {}),
        }));
      }
    }
    return [];
  })();

  const filtered = ksis.filter((k) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      String(k.id ?? "").toLowerCase().includes(s) ||
      String(k.name ?? "").toLowerCase().includes(s) ||
      String(k.description ?? "").toLowerCase().includes(s) ||
      String(k.statement ?? "").toLowerCase().includes(s)
    );
  });

  if (ksis.length === 0) {
    return (
      <div className="text-slate-400 text-sm">
        No Key Security Indicators data found in this document. This may not be a FRMR documentation file.
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search KSIs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <div className="space-y-3">
        {filtered.map((ksi, i) => (
          <div key={ksi.id ?? i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-start gap-3 mb-1">
              {ksi.id && (
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded whitespace-nowrap">
                  {ksi.id}
                </span>
              )}
              {ksi.status && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(ksi.status)}`}>
                  {ksi.status}
                </span>
              )}
              <span className="font-semibold text-slate-800 text-sm">{ksi.name ?? ksi.title ?? ""}</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              {ksi.description ?? ksi.statement ?? ""}
            </p>
            {ksi.rationale && (
              <p className="text-slate-400 text-xs mt-1 italic">{ksi.rationale}</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-400 text-sm">No KSIs match your search.</p>
        )}
      </div>
    </div>
  );
}
