"use client";

import React, { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Indicator = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Capability = { name: string; indicators: Record<string, Indicator> };

interface SecurityCapabilitiesPanelProps {
  capabilities: Record<string, Capability>;
}

function indicatorBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "implemented") return "bg-green-100 text-green-700";
  if (s === "in-progress" || s === "in_progress") return "bg-yellow-100 text-yellow-700";
  if (s === "not-implemented" || s === "not_implemented") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-600";
}

function indicatorDot(status: string) {
  const s = status?.toLowerCase();
  if (s === "implemented") return "bg-green-500";
  if (s === "in-progress" || s === "in_progress") return "bg-yellow-500";
  if (s === "not-implemented" || s === "not_implemented") return "bg-red-500";
  return "bg-slate-400";
}

export default function SecurityCapabilitiesPanel({ capabilities }: SecurityCapabilitiesPanelProps) {
  const entries = Object.entries(capabilities ?? {});
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(entries.map(([k]) => [k, true]))
  );

  if (entries.length === 0) {
    return <p className="text-slate-400 text-sm">No security capabilities found.</p>;
  }

  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-4">
      {entries.map(([capKey, cap]) => (
        <div key={capKey} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => toggle(capKey)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                {capKey}
              </span>
              <span className="font-semibold text-slate-800">{cap.name}</span>
              <span className="text-xs text-slate-400">
                {Object.keys(cap.indicators ?? {}).length} indicators
              </span>
            </div>
            <span className="text-slate-400 text-sm">{open[capKey] ? "▲" : "▼"}</span>
          </button>
          {open[capKey] && (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {Object.entries(cap.indicators ?? {}).map(([indKey, ind]) => (
                <div key={indKey} className="px-5 py-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${indicatorBadge(ind.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${indicatorDot(ind.status)}`} />
                        {ind.status ?? "unknown"}
                      </span>
                      <span className="font-medium text-slate-800 text-sm">{ind.name ?? indKey}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{ind.statement}</p>
                    {ind.evidence && (
                      <span className="text-xs text-blue-600 font-medium mt-1 inline-block">
                        Evidence: {ind.evidence}
                      </span>
                    )}
                    {ind.sla && typeof ind.sla === "object" && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(ind.sla).map(([k, v]) => (
                          <span key={k} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                    {ind.sla && typeof ind.sla === "string" && (
                      <span className="text-xs text-slate-500 mt-1 inline-block">SLA: {ind.sla}</span>
                    )}
                    {ind.regions && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(ind.regions as string[]).map((r) => (
                          <span key={r} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{r}</span>
                        ))}
                      </div>
                    )}
                    {ind.url && (
                      <a href={ind.url} className="text-xs text-blue-500 hover:underline mt-1 block" target="_blank" rel="noopener noreferrer">
                        {ind.url}
                      </a>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-300">{indKey}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
