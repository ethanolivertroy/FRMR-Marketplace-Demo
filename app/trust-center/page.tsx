"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TrustCenterHeader from "../components/TrustCenterHeader";
import CertificationsPanel from "../components/CertificationsPanel";
import SecurityCapabilitiesPanel from "../components/SecurityCapabilitiesPanel";
import SubprocessorsPanel from "../components/SubprocessorsPanel";
import PoliciesPanel from "../components/PoliciesPanel";
import PenTestsPanel from "../components/PenTestsPanel";
import KSIPanel from "../components/KSIPanel";
import FRRPanel from "../components/FRRPanel";
import FRDPanel from "../components/FRDPanel";
import TamboChat from "../components/TamboChat";
import TrustJsonRenderer from "../components/TrustJsonRenderer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TrustData = Record<string, any>;

function detectDocType(data: TrustData): "csp" | "frmr" {
  // FRMR docs typically have FRD/FRR/KSI top-level keys or info.type indicating FRMR
  if (data.FRD || data.FRR || data.KSI) return "frmr";
  if (data.info?.type === "FRMR" || data.info?.format === "FRMR") return "frmr";
  // CSP trust centers have certifications, security_capabilities, etc.
  if (data.certifications || data.security_capabilities || data.subprocessors) return "csp";
  // Fall back: check for any FRMR-like keys
  const keys = Object.keys(data).map((k) => k.toUpperCase());
  if (keys.some((k) => k.includes("FRD") || k.includes("FRR") || k.includes("KSI"))) return "frmr";
  return "csp";
}

const CSP_TABS = [
  { id: "certifications", label: "🏅 Certifications" },
  { id: "security", label: "🔒 Security" },
  { id: "policies", label: "📋 Policies" },
  { id: "subprocessors", label: "🔗 Subprocessors" },
  { id: "pen-tests", label: "🔍 Pen Tests" },
  { id: "json-render", label: "🎨 JSON Render" },
];

const FRMR_TABS = [
  { id: "ksi", label: "🔑 KSI" },
  { id: "frr", label: "📌 FRR" },
  { id: "frd", label: "📖 FRD" },
];

function TrustCenterInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") ?? "";

  const [data, setData] = useState<TrustData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (!url) {
      setError("No URL provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const apiUrl = `/api/trust-data?url=${encodeURIComponent(url)}`;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load trust data");
      })
      .finally(() => setLoading(false));
  }, [url]);

  // Set default tab when data loads
  useEffect(() => {
    if (!data) return;
    const docType = detectDocType(data);
    if (docType === "frmr") {
      setActiveTab("ksi");
    } else {
      setActiveTab("certifications");
    }
  }, [data]);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No URL provided.</p>
          <button onClick={() => router.push("/")} className="text-blue-600 hover:underline text-sm">
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading trust data…</p>
          <p className="text-slate-400 text-xs mt-1 max-w-xs truncate">{url}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to load trust data</h2>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <p className="text-slate-400 text-xs mb-6 break-all">{url}</p>
          <button onClick={() => router.push("/")} className="text-blue-600 hover:underline text-sm">
            ← Try a different URL
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const docType = detectDocType(data);
  const tabs = docType === "frmr" ? FRMR_TABS : CSP_TABS;

  return (
    <div className="min-h-screen bg-slate-50">
      <TrustCenterHeader data={data} docType={docType} />

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 pt-3">
        <button onClick={() => router.push("/")} className="text-xs text-slate-400 hover:text-blue-600 transition">
          ← Back to home
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 flex gap-6 flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="pb-12">
            {docType === "csp" && (
              <>
                {activeTab === "certifications" && (
                  <CertificationsPanel certifications={data.certifications ?? {}} />
                )}
                {activeTab === "security" && (
                  <SecurityCapabilitiesPanel capabilities={data.security_capabilities ?? {}} />
                )}
                {activeTab === "policies" && (
                  <PoliciesPanel policies={data.policies ?? {}} />
                )}
                {activeTab === "subprocessors" && (
                  <SubprocessorsPanel subprocessors={data.subprocessors ?? []} />
                )}
                {activeTab === "pen-tests" && (
                  <PenTestsPanel penTests={data.pen_tests ?? []} />
                )}
                {activeTab === "json-render" && (
                  <TrustJsonRenderer data={data} />
                )}
              </>
            )}
            {docType === "frmr" && (
              <>
                {activeTab === "ksi" && <KSIPanel data={data} />}
                {activeTab === "frr" && <FRRPanel data={data} />}
                {activeTab === "frd" && <FRDPanel data={data} />}
              </>
            )}
          </div>
        </div>

        {/* Sidebar: Tambo Chat */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-6">
            <TamboChat trustData={data} />
            {/* Raw JSON link */}
            <div className="mt-4 text-center">
              <a
                href={url.startsWith("/") ? url : `/api/trust-data?url=${encodeURIComponent(url)}`}
                className="text-xs text-slate-400 hover:text-blue-600 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                View raw JSON →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrustCenterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <TrustCenterInner />
    </Suspense>
  );
}
