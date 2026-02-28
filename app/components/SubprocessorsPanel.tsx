import React from "react";

interface Subprocessor {
  name: string;
  purpose: string;
  location: string;
  certifications?: string[];
}

interface SubprocessorsPanelProps {
  subprocessors: Subprocessor[];
}

export default function SubprocessorsPanel({ subprocessors }: SubprocessorsPanelProps) {
  if (!subprocessors || subprocessors.length === 0) {
    return <p className="text-slate-400 text-sm">No subprocessors listed.</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-5 py-3 text-left font-semibold">Name</th>
            <th className="px-5 py-3 text-left font-semibold">Purpose</th>
            <th className="px-5 py-3 text-left font-semibold">Location</th>
            <th className="px-5 py-3 text-left font-semibold">Certifications</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {subprocessors.map((sp, i) => (
            <tr key={i} className="hover:bg-slate-50 transition">
              <td className="px-5 py-3 font-medium text-slate-800">{sp.name}</td>
              <td className="px-5 py-3 text-slate-600">{sp.purpose}</td>
              <td className="px-5 py-3 text-slate-600">{sp.location}</td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1">
                  {(sp.certifications ?? []).map((c) => (
                    <span key={c} className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
