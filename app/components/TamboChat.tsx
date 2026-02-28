"use client";

import React, { useState } from "react";

interface TamboChatProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trustData: Record<string, any>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const API_KEY = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

export default function TamboChat({ trustData }: TamboChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!API_KEY) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <div className="text-2xl mb-2">🤖</div>
        <p className="text-slate-600 font-medium text-sm mb-1">AI-Powered Querying</p>
        <p className="text-xs text-slate-400">
          Add your{" "}
          <code className="bg-slate-200 px-1 rounded font-mono">NEXT_PUBLIC_TAMBO_API_KEY</code>{" "}
          to enable AI-powered querying of trust data.
        </p>
      </div>
    );
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const contextStr = JSON.stringify(trustData, null, 2).slice(0, 8000);
      const response = await fetch("https://api.tambo.ai/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a helpful security and compliance assistant. Answer questions about the following trust center data:\n\n${contextStr}`,
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg.content },
          ],
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const assistantContent =
        data.choices?.[0]?.message?.content ?? data.content ?? "No response";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
      >
        <span className="flex items-center gap-2">🤖 Ask AI about this trust data</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="flex flex-col h-80">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-slate-400 text-xs text-center mt-4">
                Ask anything about this trust center data...
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 rounded-xl px-3 py-2 text-xs">
                  Thinking…
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-slate-200 p-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question…"
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
