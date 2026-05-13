"use client";
import Link from "next/link";
import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
];

function selectLang(code: string) {
  try {
    localStorage.setItem("zro_lang", code);
    if (code && code !== "en") {
      document.cookie = "googtrans=/en/" + code + "; path=/";
      document.cookie = "googtrans=/en/" + code + "; path=/; domain=" + location.hostname;
    } else {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=" + location.hostname;
    }
  } catch (e) {}
  window.location.reload();
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-ink/70 border-b border-line">
      <div className="wrap flex items-center justify-between h-16">
        <Link href="#hero" className="flex items-center">
          <ZholyWordmark />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-cream/80">
          <Link href="#how" className="hover:text-cream transition-colors">How it works</Link>
          <Link href="/demo" className="hover:text-cream transition-colors flex items-center gap-1.5"><span style={{width:6,height:6,borderRadius:"50%",background:"#FF3D3D",display:"inline-block",animation:"pulse 2s infinite"}} />Live Demo</Link>
          <Link href="#dashboard" className="hover:text-cream transition-colors">Dashboard</Link>
          <Link href="#pricing" className="hover:text-cream transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-cream transition-colors">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* Language picker */}
          <div className="relative">
            <button
              aria-label="Select language"
              onClick={() => setLangOpen(!langOpen)}
              className="h-9 w-9 grid place-items-center rounded-full border border-line text-cream/70 hover:text-cream hover:border-cream/40 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-line bg-elevated shadow-xl overflow-hidden">
                  <div className="max-h-72 overflow-y-auto py-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLangOpen(false); selectLang(lang.code); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-cream/80 hover:bg-line/40 hover:text-cream flex items-center gap-3 transition-colors"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <Link href="/signin" className="hidden sm:block text-sm text-cream/80 hover:text-cream">Sign in</Link>
          <Link href="/signup" className="btn btn-cyan">Start free <span className="btn-arrow">→</span></Link>
          <button
            aria-label="Menu"
            className="md:hidden h-9 w-9 grid place-items-center rounded-full border border-line"
            onClick={() => setOpen(!open)}
          >
            <span className="block w-4 h-px bg-cream relative before:content-[''] before:absolute before:w-4 before:h-px before:bg-cream before:-top-1.5 after:content-[''] after:absolute after:w-4 after:h-px after:bg-cream after:top-1.5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-line bg-ink">
          <div className="wrap py-4 flex flex-col gap-3 text-sm text-cream/80">
            <Link href="#how" onClick={() => setOpen(false)}>How it works</Link>
            <Link href="/demo" onClick={() => setOpen(false)}>Live Demo</Link>
            <Link href="#dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link href="#pricing" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="#faq" onClick={() => setOpen(false)}>FAQ</Link>
            <Link href="/signin" onClick={() => setOpen(false)}>Sign in</Link>
            <div className="pt-2 border-t border-line">
              <p className="text-xs text-muted mb-2 font-mono tracking-widest">LANGUAGE</p>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setOpen(false); selectLang(lang.code); }}
                    className="text-left px-2 py-1.5 text-sm text-cream/70 hover:text-cream flex items-center gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function ZholyWordmark() {
  return (
    <span
      style={{
        fontFamily: "var(--sans)",
        fontWeight: 500,
        fontSize: "15px",
        letterSpacing: "0.28em",
        color: "#ffffff",
        textTransform: "uppercase",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      ZHOLY
    </span>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: "var(--sans)",
        fontWeight: 500,
        fontSize: `${size}px`,
        letterSpacing: "0.28em",
        color: "#ffffff",
        textTransform: "uppercase",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      ZHOLY
    </span>
  );
}
