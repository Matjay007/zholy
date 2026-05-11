import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/publicSite";

const canonical = siteUrl();

export const metadata: Metadata = {
  title: "ZHOLY — Interfaces that act.",
  description:
    "Conversational interfaces that guide, navigate, and execute in real time. Reduce support load, qualify visitors automatically, and convert more traffic — without expanding your team. A Swiss company.",
  metadataBase: new URL(canonical),
  openGraph: {
    title: "ZHOLY — Interfaces that act.",
    description:
      "AI Sales Concierge for your website. Qualifies, highlights, books, captures — all inside the conversation. Open source. Swiss-incorporated.",
    url: canonical,
    siteName: "ZHOLY",
    type: "website",
  },
  icons: { icon: "/voice/favicon.png", apple: "/voice/zholy-logo.png" },
};

const gatewayBase =
  process.env.NEXT_PUBLIC_ZRO_GATEWAY_URL?.trim() || "http://127.0.0.1:8790";

const embedSrc = `${gatewayBase}/embed/zholy-embed.js?${new URLSearchParams({
  gateway: gatewayBase,
  brand: "ZHOLY",
  buttonText: "Talk to ZHOLY",
  video: "1",
}).toString()}`;

const companyProfile = {
  name: "ZHOLY",
  description:
    "ZHOLY (pronounced 'Zero Voice') is an AI voice assistant platform that embeds onto any website. Visitors click the mic button and speak naturally — the AI reads the page, answers questions, navigates by voice, and captures leads. Built for businesses that want voice AI without complexity.",
  services: [
    "Embeddable voice AI widget for websites",
    "Natural language page navigation and product discovery",
    "Video mode — visitor points camera at a product, AI identifies it",
    "Multilingual voice support — auto-detects visitor language",
    "Lead capture form after voice conversations",
    "White-label and custom branding",
    "Self-hostable — one server, your data",
  ],
  outOfScope: ["Banking", "Medical advice", "Legal advice"],
  mustNotClaim: [
    "Specific pricing not confirmed on this page",
    "Features not listed here",
  ],
};

const companyProfileScript = `window.ZRO_COMPANY_PROFILE=${JSON.stringify(companyProfile)};`;

/** Restore saved language and set googtrans cookie so GT translates on load. */
const langScript = `
(function(){
  try {
    var l = localStorage.getItem("zro_lang") || "";
    if (l) window.ZHOLY_LANG = l;
    if (l && l !== "en") {
      document.cookie = "googtrans=/en/" + l + "; path=/";
      document.cookie = "googtrans=/en/" + l + "; path=/; domain=" + location.hostname;
    } else if (!l || l === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=" + location.hostname;
    }
  } catch(e) {}
})();
`.trim();

/** Google Translate init — invisible widget, no toolbar. */
const gTranslateInit = `
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: "en",
    autoDisplay: false,
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, "zro_gt_el");
}
`.trim();

/** Inject CSS as early as possible to kill every GT UI element before paint. */
const hideGTStyle = `
(function(){
  var s = document.createElement("style");
  s.textContent =
    ".goog-te-banner-frame,.skiptranslate{display:none!important;visibility:hidden!important;}" +
    ".goog-te-gadget{display:none!important;}" +
    ".goog-te-menu-frame{display:none!important;}" +
    "body{top:0!important;}" +
    "#google_translate_element{display:none!important;}";
  (document.head || document.documentElement).appendChild(s);
  // Re-apply after GT loads (it may try to push body down)
  setTimeout(function(){(document.head || document.documentElement).appendChild(s.cloneNode(true));}, 800);
  setTimeout(function(){(document.head || document.documentElement).appendChild(s.cloneNode(true));}, 2000);
})();
`.trim();

/** Pill anchored BOTTOM-CENTRE (Foyer's tl-pos-bottom-center pattern).
 *  Mic icon replaced with the ZHOLY orb image (background-image swap on the
 *  icon disc; the inner SVG is hidden, so the brand mark is what visitors see). */
const styleEmbedChrome = `(function(){
  var s = document.createElement("style");
  s.textContent =
    /* Anchor bottom-centre of the viewport */
    "#zrovoice-root{position:fixed!important;top:auto!important;right:auto!important;bottom:24px!important;left:50%!important;transform:translateX(-50%)!important;pointer-events:none!important;background:transparent!important;border:none!important;box-shadow:none!important;z-index:2147483646!important;}" +
    /* Persistent launch pill — dark glass, cyan hairline */
    "#zrovoice-root #tl-trigger{pointer-events:auto!important;display:inline-flex!important;align-items:center!important;gap:12px!important;padding:8px 24px 8px 8px!important;border-radius:9999px!important;background:rgba(28,29,34,0.92)!important;color:#EBEAE6!important;font-family:var(--font-satoshi,'Satoshi',system-ui,sans-serif)!important;font-weight:600!important;font-size:14px!important;letter-spacing:0.01em!important;box-shadow:0 20px 60px rgba(0,0,0,0.45),0 0 0 1px rgba(76,233,233,0.25)!important;-webkit-backdrop-filter:blur(16px)!important;backdrop-filter:blur(16px)!important;transition:transform 160ms ease,box-shadow 160ms ease!important;cursor:pointer!important;}" +
    "#zrovoice-root #tl-trigger:hover{transform:translateY(-2px)!important;box-shadow:0 28px 80px rgba(0,0,0,0.55),0 0 0 1px rgba(76,233,233,0.5)!important;}" +
    /* Icon disc — show the ZHOLY orb image (kills the generic mic) */
    "#zrovoice-root #tl-trigger .tl-trigger-icon{width:40px!important;height:40px!important;border-radius:50%!important;background:#0E0F12 url('/zholy-orb.png') center/cover no-repeat!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 0 24px rgba(76,233,233,0.4),inset 0 0 0 1px rgba(76,233,233,0.3)!important;flex-shrink:0!important;}" +
    /* Hide the generic mic SVG inside the disc */
    "#zrovoice-root #tl-trigger .tl-trigger-icon svg{display:none!important;}" +
    /* Soft cyan breathing pulse around the icon disc */
    "#zrovoice-root #tl-trigger .tl-trigger-icon::after{content:''!important;position:absolute!important;width:40px!important;height:40px!important;border-radius:50%!important;border:1px solid rgba(76,233,233,0.4)!important;animation:zholy-pulse 2.4s ease-out infinite!important;pointer-events:none!important;}" +
    "@keyframes zholy-pulse{0%{transform:scale(1);opacity:1}100%{transform:scale(1.6);opacity:0}}" +
    /* Active call bar — same surface, sits where the pill was (bottom-centre) */
    "#zrovoice-root #tl-call-bar{pointer-events:auto!important;padding:12px 18px!important;border-radius:9999px!important;box-shadow:0 24px 80px rgba(0,0,0,0.55),0 0 0 1px rgba(76,233,233,0.25)!important;-webkit-backdrop-filter:blur(16px)!important;backdrop-filter:blur(16px)!important;background:rgba(28,29,34,0.92)!important;}" +
    /* Transcript toggle — the small \"Transcript\" pill above the bar */
    "#zrovoice-root #tl-transcript-toggle{pointer-events:auto!important;cursor:pointer!important;}" +
    /* Transcript popup panel — repositioned to float ABOVE the bottom-centre pill */
    "#zrovoice-root #tl-transcript-panel{pointer-events:auto!important;position:absolute!important;bottom:calc(100% + 16px)!important;left:50%!important;right:auto!important;top:auto!important;transform:translateX(-50%) translateY(8px)!important;width:min(420px,92vw)!important;max-height:min(560px,70vh)!important;display:flex!important;flex-direction:column!important;gap:12px!important;padding:16px!important;border-radius:20px!important;background:rgba(28,29,34,0.96)!important;box-shadow:0 32px 96px rgba(0,0,0,0.6),0 0 0 1px rgba(76,233,233,0.25)!important;-webkit-backdrop-filter:blur(20px)!important;backdrop-filter:blur(20px)!important;opacity:0!important;visibility:hidden!important;transition:opacity 200ms ease,transform 200ms ease,visibility 200ms!important;}" +
    "#zrovoice-root #tl-transcript-panel.tl-open{opacity:1!important;visibility:visible!important;transform:translateX(-50%) translateY(0)!important;}" +
    /* Transcript scroll area */
    "#zrovoice-root #tl-transcript{pointer-events:auto!important;flex:1 1 auto!important;min-height:120px!important;max-height:340px!important;overflow-y:auto!important;padding:4px 4px 4px 0!important;display:flex!important;flex-direction:column!important;gap:8px!important;}" +
    /* Lead form inputs */
    "#zrovoice-root #tl-lead-form{pointer-events:auto!important;display:flex!important;flex-direction:column!important;gap:8px!important;}" +
    "#zrovoice-root #tl-lead-form input{pointer-events:auto!important;width:100%!important;padding:10px 14px!important;border-radius:9999px!important;background:rgba(255,255,255,0.05)!important;border:1px solid rgba(255,255,255,0.1)!important;color:#EBEAE6!important;font-family:var(--font-satoshi,'Satoshi',system-ui,sans-serif)!important;font-size:13px!important;outline:none!important;}" +
    "#zrovoice-root #tl-lead-form input:focus{border-color:#4CE9E9!important;background:rgba(76,233,233,0.06)!important;}" +
    "#zrovoice-root #tl-lead-form input::placeholder{color:rgba(235,234,230,0.35)!important;}" +
    "#zrovoice-root #tl-lead-submit{pointer-events:auto!important;cursor:pointer!important;padding:10px 16px!important;border-radius:9999px!important;background:#4CE9E9!important;color:#1C1D22!important;border:none!important;font-family:var(--font-satoshi,'Satoshi',system-ui,sans-serif)!important;font-weight:600!important;font-size:13px!important;}" +
    /* Chat input row — type-to-talk for users who prefer keyboard */
    "#zrovoice-root #tl-chat-input{pointer-events:auto!important;display:flex!important;gap:8px!important;align-items:center!important;padding-top:4px!important;border-top:1px solid rgba(255,255,255,0.08)!important;}" +
    "#zrovoice-root #tl-text-input{pointer-events:auto!important;flex:1 1 auto!important;padding:10px 14px!important;border-radius:9999px!important;background:rgba(255,255,255,0.06)!important;border:1px solid rgba(255,255,255,0.1)!important;color:#EBEAE6!important;font-family:var(--font-satoshi,'Satoshi',system-ui,sans-serif)!important;font-size:13px!important;outline:none!important;}" +
    "#zrovoice-root #tl-text-input:focus{border-color:#4CE9E9!important;background:rgba(76,233,233,0.06)!important;}" +
    "#zrovoice-root #tl-text-input::placeholder{color:rgba(235,234,230,0.4)!important;}" +
    "#zrovoice-root #tl-send{pointer-events:auto!important;cursor:pointer!important;width:36px!important;height:36px!important;border-radius:50%!important;background:#4CE9E9!important;color:#1C1D22!important;border:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;box-shadow:0 0 12px rgba(76,233,233,0.3)!important;}" +
    "#zrovoice-root #tl-send svg{width:14px!important;height:14px!important;fill:#1C1D22!important;}" +
    /* Camera preview wrap (when active) */
    "#zrovoice-root #tl-camera-preview-wrap{pointer-events:auto!important;}" +
    "#zrovoice-root #tl-video-surface{pointer-events:auto!important;}";
  (document.head || document.documentElement).appendChild(s);
})();`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
        <script dangerouslySetInnerHTML={{ __html: companyProfileScript }} />
        <script dangerouslySetInnerHTML={{ __html: hideGTStyle }} />
        <script dangerouslySetInnerHTML={{ __html: styleEmbedChrome }} />
        <script dangerouslySetInnerHTML={{ __html: gTranslateInit }} />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
      </head>
      <body>
        {/* GT mount point — always hidden */}
        <div id="zro_gt_el" style={{ display: "none" }} />
        {children}
        <script type="module" src={embedSrc} async />
      </body>
    </html>
  );
}
