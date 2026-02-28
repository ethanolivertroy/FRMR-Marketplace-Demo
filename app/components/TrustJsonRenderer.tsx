"use client";

import { createRenderer } from "@json-render/react";
import type { Spec } from "@json-render/react";
import { trustCatalog } from "../lib/trust-catalog";

/** React renderer built from the trust catalog. */
const TrustRenderer = createRenderer(trustCatalog, {
  Section: ({ element, children }) => {
    const props = element.props as { title: string };
    return (
      <div className="mb-6">
        {props.title && (
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 border-b border-slate-200 pb-2">
            {props.title}
          </h3>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
      </div>
    );
  },

  Card: ({ element, children }) => {
    const props = element.props as {
      title: string;
      status?: string;
      description?: string;
    };
    const s = props.status;
    const colorCls =
      s === "implemented" || s === "current" || s === "authorized"
        ? "border-green-200 bg-green-50"
        : s === "in-progress"
        ? "border-yellow-200 bg-yellow-50"
        : s === "expired" || s === "error"
        ? "border-red-200 bg-red-50"
        : "border-slate-200 bg-white";

    const badgeColor =
      s === "implemented" || s === "current" || s === "authorized"
        ? "bg-green-100 text-green-700"
        : s === "in-progress"
        ? "bg-yellow-100 text-yellow-700"
        : s === "expired"
        ? "bg-red-100 text-red-700"
        : "bg-slate-100 text-slate-500";

    return (
      <div className={`rounded-xl border ${colorCls} p-4`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-semibold text-slate-800 text-sm leading-tight">
            {props.title}
          </span>
          {s && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
              {s}
            </span>
          )}
        </div>
        {props.description && (
          <p className="text-slate-500 text-xs leading-relaxed mb-2">
            {props.description}
          </p>
        )}
        {children && <div className="space-y-1 mt-1">{children}</div>}
      </div>
    );
  },

  InfoRow: ({ element }) => {
    const props = element.props as { label: string; value: string };
    return (
      <div className="flex gap-1.5 text-xs text-slate-600">
        <span className="font-medium text-slate-500 shrink-0">{props.label}:</span>
        <span className="text-slate-700">{props.value}</span>
      </div>
    );
  },

  Badge: ({ element }) => {
    const props = element.props as {
      label: string;
      variant: "success" | "warning" | "error" | "neutral";
    };
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-700",
      warning: "bg-yellow-100 text-yellow-700",
      error: "bg-red-100 text-red-700",
      neutral: "bg-slate-100 text-slate-500",
    };
    return (
      <span
        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
          colors[props.variant] ?? colors.neutral
        }`}
      >
        {props.label}
      </span>
    );
  },
});

// --- Spec builder ---

type AnyObj = Record<string, unknown>;

let _counter = 0;
const uid = () => `el-${_counter++}`;

/** Convert CSP trust data into a flat json-render Spec. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCspSpec(data: AnyObj): Spec {
  _counter = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elements: Record<string, any> = {};
  const rootChildren: string[] = [];

  // Certifications
  if (data.certifications && typeof data.certifications === "object") {
    const sectionId = uid();
    const certIds: string[] = [];

    for (const [key, cert] of Object.entries(data.certifications as AnyObj)) {
      const c = cert as AnyObj;
      const cardId = uid();
      const childIds: string[] = [];

      if (c.auditor) {
        const r = uid();
        elements[r] = { type: "InfoRow", props: { label: "Auditor", value: String(c.auditor) }, children: [] };
        childIds.push(r);
      }
      if (c.certifying_body) {
        const r = uid();
        elements[r] = { type: "InfoRow", props: { label: "Certifying body", value: String(c.certifying_body) }, children: [] };
        childIds.push(r);
      }
      if (c.authorization_date) {
        const r = uid();
        elements[r] = { type: "InfoRow", props: { label: "Authorized", value: String(c.authorization_date) }, children: [] };
        childIds.push(r);
      }
      if (c.issued_date) {
        const r = uid();
        elements[r] = { type: "InfoRow", props: { label: "Issued", value: String(c.issued_date) }, children: [] };
        childIds.push(r);
      }
      if (c.expiry_date) {
        const r = uid();
        elements[r] = { type: "InfoRow", props: { label: "Expires", value: String(c.expiry_date) }, children: [] };
        childIds.push(r);
      }

      elements[cardId] = {
        type: "Card",
        props: {
          title: String(c.name ?? key),
          status: String(c.status ?? "neutral"),
          description: c.level ? String(c.level) : undefined,
        },
        children: childIds,
      };
      certIds.push(cardId);
    }

    elements[sectionId] = {
      type: "Section",
      props: { title: "Certifications" },
      children: certIds,
    };
    rootChildren.push(sectionId);
  }

  // Security Capabilities
  if (data.security_capabilities && typeof data.security_capabilities === "object") {
    for (const [domainKey, domain] of Object.entries(
      data.security_capabilities as AnyObj
    )) {
      const d = domain as AnyObj;
      const sectionId = uid();
      const cardIds: string[] = [];
      const indicators = (d.indicators ?? {}) as AnyObj;

      for (const [indKey, ind] of Object.entries(indicators)) {
        const iv = ind as AnyObj;
        const cardId = uid();
        const childIds: string[] = [];

        if (iv.sla && typeof iv.sla === "string") {
          const r = uid();
          elements[r] = { type: "InfoRow", props: { label: "SLA", value: iv.sla }, children: [] };
          childIds.push(r);
        }
        if (iv.frequency) {
          const r = uid();
          elements[r] = { type: "InfoRow", props: { label: "Frequency", value: String(iv.frequency) }, children: [] };
          childIds.push(r);
        }
        if (iv.evidence) {
          const r = uid();
          elements[r] = { type: "InfoRow", props: { label: "Evidence", value: String(iv.evidence) }, children: [] };
          childIds.push(r);
        }

        elements[cardId] = {
          type: "Card",
          props: {
            title: String(iv.name ?? indKey),
            status: String(iv.status ?? "neutral"),
            description: String(iv.statement ?? ""),
          },
          children: childIds,
        };
        cardIds.push(cardId);
      }

      elements[sectionId] = {
        type: "Section",
        props: { title: String(d.name ?? domainKey) },
        children: cardIds,
      };
      rootChildren.push(sectionId);
    }
  }

  // Fallback
  if (rootChildren.length === 0) {
    const sectionId = uid();
    const infoId = uid();
    const info = data.info as AnyObj | undefined;
    elements[infoId] = {
      type: "InfoRow",
      props: { label: "Title", value: String(info?.title ?? "Trust Data") },
      children: [],
    };
    elements[sectionId] = {
      type: "Section",
      props: { title: "Overview" },
      children: [infoId],
    };
    rootChildren.push(sectionId);
  }

  const rootId = "root";
  elements[rootId] = {
    type: "Section",
    props: { title: "" },
    children: rootChildren,
  };

  return { root: rootId, elements };
}

interface TrustJsonRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

/**
 * Renders CSP trust center data using the json-render framework.
 *
 * Converts the structured JSON into a flat Spec, then uses the TrustRenderer
 * (built with `createRenderer` from @json-render/react) to produce the UI.
 * This makes the rendering layer fully data-driven — any agent or transform
 * that produces a valid Spec can drive this same renderer.
 */
export default function TrustJsonRenderer({ data }: TrustJsonRendererProps) {
  const spec = buildCspSpec(data);
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <span className="text-blue-600 text-sm font-medium">
          🎨 Rendered via{" "}
          <a
            href="https://json-render.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-800"
          >
            json-render
          </a>
        </span>
        <span className="text-slate-400 text-xs">
          — a JSON spec drives this UI, not hard-coded components
        </span>
      </div>
      <TrustRenderer spec={spec} />
    </div>
  );
}
