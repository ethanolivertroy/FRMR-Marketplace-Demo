"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FRMR_URL =
  "https://raw.githubusercontent.com/FedRAMP/docs/main/FRMR.documentation.json";
const SAMPLE_URL = "/sample-trust-data.json";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState(FRMR_URL);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    router.push(`/trust-center?url=${encodeURIComponent(url.trim())}`);
  }

  function loadSample() {
    setLoading(true);
    router.push(`/trust-center?url=${encodeURIComponent(SAMPLE_URL)}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
          Open Standard
        </span>
        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
          Machine-Readable
          <br />
          <span className="text-blue-600">Trust Centers</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
          Companies shouldn&apos;t need to run their own trust centers. If every cloud
          service provider publishes a machine-readable document in an open format
          (like FedRAMP&apos;s FRMR JSON), anyone can ingest it and render a trust
          center that looks exactly the way they want.
        </p>
        <p className="text-base text-slate-500 max-w-xl mx-auto mb-12">
          Enter any FRMR-compatible JSON URL below — or try the live FedRAMP docs
          or a sample CSP dataset to see it in action.
        </p>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? "Loading…" : "View Trust Center"}
          </button>
        </form>

        <button
          onClick={loadSample}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 transition text-sm disabled:opacity-60"
        >
          <span>🏢</span> Try Sample CSP Data (AcmeCorp)
        </button>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "📄",
              title: "CSP publishes JSON",
              desc: "Cloud service providers publish a machine-readable trust document at a stable URL — certifications, security controls, policies, and more.",
            },
            {
              icon: "🔍",
              title: "Anyone ingests it",
              desc: "Enterprises, auditors, or tooling can fetch and parse the document without scraping HTML trust center pages.",
            },
            {
              icon: "🎨",
              title: "Render your own view",
              desc: "Display the data in any format you like — security dashboards, vendor questionnaires, or trust center UIs like this one.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
