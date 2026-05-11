"use client";

import { useState } from "react";

interface Props {
  id: string;
  startedAt: string;
  agentName: string;
  visitorPage: string | null;
  duration: string;
  leadCaptured: boolean;
  transcript: Array<{ role: string; text: string }>;
}

export default function ConvRow({
  startedAt,
  agentName,
  visitorPage,
  duration,
  leadCaptured,
  transcript,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-ink-3 transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-5 py-3">
          <p className="text-cream text-sm">{startedAt}</p>
        </td>
        <td className="px-5 py-3 hidden md:table-cell">
          <p className="text-muted text-sm">{agentName}</p>
        </td>
        <td className="px-5 py-3 hidden lg:table-cell">
          <p className="text-muted text-sm truncate max-w-[200px]">
            {visitorPage || "—"}
          </p>
        </td>
        <td className="px-5 py-3">
          <p className="text-muted text-sm font-mono">{duration}</p>
        </td>
        <td className="px-5 py-3">
          {leadCaptured ? (
            <span
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: "rgba(247,124,39,0.15)", color: "#F77C27" }}
            >
              LEAD
            </span>
          ) : (
            <span className="text-muted text-xs">—</span>
          )}
        </td>
        <td className="px-5 py-3 text-right">
          <span className="text-muted text-xs">{open ? "▲" : "▼"}</span>
        </td>
      </tr>
      {open && (
        <tr>
          <td
            colSpan={6}
            className="px-5 py-4 border-b border-line"
            style={{ background: "#141414" }}
          >
            {transcript.length === 0 ? (
              <p className="text-muted text-sm">No transcript available.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transcript.map(
                  (t: { role: string; text: string }, i: number) => (
                    <div key={i} className="flex gap-3">
                      <span
                        className="text-[10px] font-mono tracking-widest uppercase flex-shrink-0 pt-0.5 w-14"
                        style={{
                          color:
                            t.role === "user" ? "#4CE9E9" : "#F77C27",
                        }}
                      >
                        {t.role}
                      </span>
                      <span className="text-cream/80 text-sm leading-relaxed">
                        {t.text}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
