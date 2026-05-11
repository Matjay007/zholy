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
  pos: "bottom-center",
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

/** MINIMAL embed brand overlay. The embed handles its own positioning via
 *  pos=bottom-center URL param — we don't fight its CSS. Only thing we
 *  override is the icon disc inside the pill (swap generic mic for ZHOLY orb)
 *  and lift the cyan accent to match brand. */
const styleEmbedChrome = `(function(){
  var s = document.createElement("style");
  s.textContent =
    /* Brand-tint accent variables for the embed */
    "#zrovoice-root{--tl-primary:#4CE9E9!important;--tl-primary-light:#7DEFEF!important;}" +
    /* Swap the mic icon disc with the ZHOLY orb image */
    "#zrovoice-root #tl-trigger .tl-trigger-icon{background:#0E0F12 url('/zholy-orb.png') center/cover no-repeat!important;box-shadow:0 0 18px rgba(76,233,233,0.35),inset 0 0 0 1px rgba(76,233,233,0.3)!important;}" +
    "#zrovoice-root #tl-trigger .tl-trigger-icon svg{display:none!important;}";
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
