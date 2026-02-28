import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Policy = Record<string, any>;

interface PoliciesPanelProps {
  policies: Record<string, Policy>;
}

export default function PoliciesPanel({ policies }: PoliciesPanelProps) {
  const entries = Object.entries(policies ?? {});

  if (entries.length === 0) {
    return <p className="text-slate-400 text-sm">No policies found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {entries.map(([key, policy]) => (
        <div key={key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">{policy.name ?? key}</h3>
            <div className="flex gap-1 flex-wrap">
              {policy.gdpr_compliant && (
                <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded">GDPR</span>
              )}
              {policy.ccpa_compliant && (
                <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded">CCPA</span>
              )}
              {policy.bug_bounty && (
                <span className="text-xs bg-orange-50 text-orange-700 font-medium px-2 py-0.5 rounded">Bug Bounty</span>
              )}
            </div>
          </div>
          <dl className="text-xs text-slate-500 space-y-1">
            {policy.last_updated && (
              <div><span className="font-medium text-slate-600">Last updated:</span> {policy.last_updated}</div>
            )}
            {policy.bug_bounty_platform && (
              <div><span className="font-medium text-slate-600">Platform:</span> {policy.bug_bounty_platform}</div>
            )}
          </dl>
          {policy.url && (
            <a
              href={policy.url}
              className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Policy →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
