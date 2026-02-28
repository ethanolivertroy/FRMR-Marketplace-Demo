"use client";

import React, { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

interface KSIPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

/** Extract KSI domains from FRMR top-level data */
function extractKSIDomains(data: AnyObj): AnyObj[] {
  // FRMR format: data.KSI is a dict of domains (IAM, VDR, etc.)
  const ksiSection = data.KSI ?? data.ksi ?? data.key_security_indicators;
  if (ksiSection && typeof ksiSection === "object" && !Array.isArray(ksiSection)) {
    // Skip info key if present
    return Object.entries(ksiSection)
      .filter(([k]) => k !== "info")
      .map(([k, v]) => ({
        domainKey: k,
        ...(typeof v === "object" && v !== null ? (v as AnyObj) : {}),
      }));
  }
  if (Array.isArray(ksiSection)) return ksiSection;
  return [];
}

export default function KSIPanel({ data }: KSIPanelProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const domains = extractKSIDomains(data);

  const filtered = domains.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const domainMatch =
      String(d.domainKey ?? "").toLowerCase().includes(s) ||
      String(d.id ?? "").toLowerCase().includes(s) ||
      String(d.name ?? "").toLowerCase().includes(s) ||
      String(d.theme ?? "").toLowerCase().includes(s);
    if (domainMatch) return true;
    // Also search within indicators
    const indicators: AnyObj = d.indicators ?? {};
    return Object.entries(indicators).some(
      ([ik, iv]) =>
        ik.toLowerCase().includes(s) ||
        String((iv as AnyObj).name ?? "").toLowerCase().includes(s) ||
        String((iv as AnyObj).statement ?? "").toLowerCase().includes(s)
    );
  });

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  if (domains.length === 0) {
    return (
      <div className="text-slate-400 text-sm">
        No Key Security Indicators data found in this document.
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
        {filtered.map((domain) => {
          const key = String(domain.id ?? domain.domainKey ?? "");
          const isOpen = expanded[key] ?? false;
          const indicators: AnyObj = domain.indicators ?? {};
          const indicatorList = Object.entries(indicators);
          return (
            <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggle(key)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition"
              >
                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded whitespace-nowrap">
                  {domain.id ?? domain.domainKey}
                </span>
                <span className="font-semibold text-slate-800 text-sm flex-1">
                  {domain.name ?? ""}
                </span>
                {indicatorList.length > 0 && (
                  <span className="text-xs text-slate-400">{indicatorList.length} indicators</span>
                )}
                <span className="text-slate-400 text-xs ml-1">{isOpen ? "▲" : "▼"}</span>
              </button>
              {domain.theme && (
                <p className="px-4 pb-3 text-slate-500 text-xs leading-relaxed border-t border-slate-100 pt-2">
                  {domain.theme}
                </p>
              )}
              {isOpen && indicatorList.length > 0 && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {indicatorList.map(([ik, iv]) => {
                    const ind = iv as AnyObj;
                    return (
                      <div key={ik} className="px-4 py-3 bg-slate-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-400">{ik}</span>
                          {ind.name && (
                            <span className="text-sm font-medium text-slate-700">{ind.name}</span>
                          )}
                        </div>
                        {ind.statement && (
                          <p className="text-xs text-slate-600 leading-relaxed">{ind.statement}</p>
                        )}
                        {Array.isArray(ind.controls) && ind.controls.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {ind.controls.map((c: string) => (
                              <span key={c} className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-slate-400 text-sm">No KSIs match your search.</p>
        )}
      </div>
    </div>
  );
}
