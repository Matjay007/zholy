"use client";
import { useState } from "react";
import { embedSnippetSrc } from "@/lib/publicSite";

const src = embedSnippetSrc();
const SNIPPET = `<script
  type="module"
  src="${src}"
></script>`;

export default function CodeSnippet() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <div className="bg-ink-2 border border-line rounded-2xl p-5 font-mono text-[13px] text-cream/90 leading-relaxed relative">
      <button
        onClick={copy}
        className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] tracking-widest uppercase border border-line text-cream/70 hover:text-cream hover:border-cream/40 transition-colors"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="whitespace-pre-wrap pr-20">
        <span className="text-cyan">&lt;script</span>
        {`\n  `}
        <span className="text-amber">type</span>=<span className="text-cream">"module"</span>
        {`\n  `}
        <span className="text-amber">src</span>=<span className="text-cream">{`"${src}"`}</span>
        {`\n`}
        <span className="text-cyan">&gt;&lt;/script&gt;</span>
      </pre>
    </div>
  );
}
