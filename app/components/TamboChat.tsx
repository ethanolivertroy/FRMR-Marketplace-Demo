"use client";

import React, { useRef, useEffect } from "react";
import {
  TamboProvider,
  useTambo,
  useTamboThreadInput,
  ComponentRenderer,
} from "@tambo-ai/react";
import { z } from "zod";

// A simple component the Tambo AI can render in its responses
const TrustHighlight = ({ title, detail }: { title: string; detail: string }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-1">
    <div className="font-semibold text-blue-800 text-xs">{title}</div>
    <div className="text-blue-700 text-xs mt-0.5">{detail}</div>
  </div>
);

const tamboComponents = [
  {
    name: "TrustHighlight",
    description: "Highlights a specific trust center finding or answer with a title and detail",
    component: TrustHighlight,
    propsSchema: z.object({
      title: z.string().describe("Short heading for the highlight"),
      detail: z.string().describe("Detailed explanation or value"),
    }),
  },
];

interface TamboChatProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trustData: Record<string, any>;
}

/** Inner chat UI — must be rendered inside TamboProvider. */
function ChatInner({ trustData }: TamboChatProps) {
  const { messages, isStreaming, thread } = useTambo();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Unused param acknowledgement for future context injection
  void trustData;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="flex flex-col h-80">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-slate-400 text-xs text-center mt-4">
            Ask anything about this trust center data…
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[85%] rounded-xl px-3 py-2 text-xs bg-blue-600 text-white leading-relaxed">
                {msg.content
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .filter((c: any) => c.type === "text")
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .map((c: any, i: number) => (
                    <span key={i}>{c.text}</span>
                  ))}
              </div>
            ) : (
              <div className="max-w-[85%] space-y-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {msg.content.map((c: any, i: number) => {
                  if (c.type === "text") {
                    return (
                      <div
                        key={i}
                        className="rounded-xl px-3 py-2 text-xs bg-slate-100 text-slate-700 leading-relaxed"
                      >
                        {c.text}
                      </div>
                    );
                  }
                  if (c.type === "component") {
                    return (
                      <ComponentRenderer
                        key={c.id ?? i}
                        content={c}
                        threadId={thread?.thread.id ?? ""}
                        messageId={msg.id}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 rounded-xl px-3 py-2 text-xs animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-2 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isPending && submit()}
          placeholder="Ask about this trust data…"
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        <button
          onClick={() => submit()}
          disabled={isPending || !value.trim()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

/**
 * AI chat sidebar powered by the @tambo-ai/react SDK.
 *
 * Uses TamboProvider with contextHelpers to inject the current trust center
 * JSON as context, so the AI can answer questions about it. When no API key
 * is configured, shows a setup prompt.
 */
export default function TamboChat({ trustData }: TamboChatProps) {
  const API_KEY = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (!API_KEY) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <div className="text-2xl mb-2">🤖</div>
        <p className="text-slate-600 font-medium text-sm mb-1">AI-Powered Querying</p>
        <p className="text-xs text-slate-400 mb-2">
          Add your{" "}
          <code className="bg-slate-200 px-1 rounded font-mono">NEXT_PUBLIC_TAMBO_API_KEY</code>{" "}
          to enable AI-powered querying via{" "}
          <a
            href="https://tambo.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            Tambo
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-blue-600 text-white text-sm font-semibold flex items-center gap-2">
        <span>🤖 Ask AI about this trust data</span>
        <span className="text-xs opacity-60 ml-auto">
          powered by{" "}
          <a
            href="https://tambo.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline opacity-80"
          >
            Tambo
          </a>
        </span>
      </div>
      <TamboProvider
        apiKey={API_KEY}
        userKey="trust-center-demo"
        components={tamboComponents}
        contextHelpers={{
          trustCenterData: () =>
            `Trust center JSON data:\n${JSON.stringify(trustData, null, 2).slice(0, 8000)}`,
        }}
      >
        <ChatInner trustData={trustData} />
      </TamboProvider>
    </div>
  );
}
