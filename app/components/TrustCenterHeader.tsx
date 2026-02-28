import React from "react";

interface TrustCenterHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  docType: "csp" | "frmr";
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "authorized" || s === "current" || s === "implemented") {
    return (
      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        {status}
      </span>
    );
  }
  if (s === "in-progress" || s === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
      {status}
    </span>
  );
}

export default function TrustCenterHeader({ data, docType }: TrustCenterHeaderProps) {
  if (docType === "frmr") {
    const info = data.info ?? {};
    return (
      <div className="bg-white border-b border-slate-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-2 inline-block">
                FedRAMP FRMR
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{info.title ?? "FedRAMP Documentation"}</h1>
              {info.description && (
                <p className="text-slate-500 mt-1 text-sm max-w-2xl">{info.description}</p>
              )}
            </div>
            <div className="text-right text-xs text-slate-400">
              {info.version && <div>Version {info.version}</div>}
              {info.published && <div>Published {info.published}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const info = data.info ?? {};
  const fedramp = info.authorization?.fedramp_20x;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1 block">
              Trust Center
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {info.provider ?? "Unknown Provider"}
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              {info.description ?? info.title}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {fedramp && (
                <StatusBadge status={fedramp.status} />
              )}
              {fedramp?.level && (
                <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                  FedRAMP {fedramp.level}
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-1">
            {info.last_updated && <div>Last updated: {info.last_updated}</div>}
            {info.website && (
              <a
                href={info.website}
                className="text-blue-500 hover:underline block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {info.website}
              </a>
            )}
            {info.contact?.email && (
              <a href={`mailto:${info.contact.email}`} className="text-blue-500 hover:underline block">
                {info.contact.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
