import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Cert = Record<string, any>;

interface CertificationsPanelProps {
  certifications: Record<string, Cert>;
}

function statusColor(status: string) {
  const s = status?.toLowerCase();
  if (s === "current" || s === "authorized") return "bg-green-100 text-green-700 border-green-200";
  if (s === "in-progress" || s === "in_progress") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (s === "expired") return "bg-red-100 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function statusDot(status: string) {
  const s = status?.toLowerCase();
  if (s === "current" || s === "authorized") return "bg-green-500";
  if (s === "in-progress" || s === "in_progress") return "bg-yellow-500";
  if (s === "expired") return "bg-red-500";
  return "bg-slate-400";
}

export default function CertificationsPanel({ certifications }: CertificationsPanelProps) {
  const entries = Object.entries(certifications ?? {});

  if (entries.length === 0) {
    return <p className="text-slate-400 text-sm">No certifications found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([key, cert]) => (
        <div
          key={key}
          className={`rounded-xl border p-5 bg-white shadow-sm ${statusColor(cert.status)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug">{cert.name ?? key}</h3>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(cert.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${statusDot(cert.status)}`} />
              {cert.status ?? "unknown"}
            </span>
          </div>
          <dl className="text-xs space-y-1 text-slate-600">
            {cert.auditor && <div><span className="font-medium">Auditor:</span> {cert.auditor}</div>}
            {cert.certifying_body && <div><span className="font-medium">Certifying Body:</span> {cert.certifying_body}</div>}
            {cert.certificate_number && <div><span className="font-medium">Cert #:</span> {cert.certificate_number}</div>}
            {cert.package_id && <div><span className="font-medium">Package ID:</span> {cert.package_id}</div>}
            {cert.level && <div><span className="font-medium">Level:</span> {cert.level}</div>}
            {cert.issued_date && <div><span className="font-medium">Issued:</span> {cert.issued_date}</div>}
            {cert.authorization_date && <div><span className="font-medium">Authorized:</span> {cert.authorization_date}</div>}
            {cert.expiry_date && <div><span className="font-medium">Expires:</span> {cert.expiry_date}</div>}
            {cert.next_review && <div><span className="font-medium">Next Review:</span> {cert.next_review}</div>}
            {cert.report_available && (
              <div className="mt-2 inline-flex items-center gap-1 text-blue-600 font-medium">
                📋 Report available {cert.nda_required ? "(NDA required)" : ""}
              </div>
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
