import Link from "next/link";
import { siteUrl } from "@/lib/publicSite";
import { Logo } from "./Nav";

function siteHostname(): string {
  try {
    return new URL(siteUrl()).hostname;
  } catch {
    return "zholy.com";
  }
}

export default function Footer() {
  return (
    <footer className="relative border-t border-line pt-20 pb-10">
      <div className="wrap grid md:grid-cols-4 gap-12">
        <div>
          <Link href="#hero" className="flex items-center mb-4">
            <Logo size={28} />
          </Link>
          <p className="text-cream/70 max-w-xs">Your website&apos;s voice. Embeddable agent that talks, scrolls, and books.</p>
          <p className="font-mono text-[11px] tracking-widest text-muted mt-6">© 2026 Polare Group Sàrl · CHE-221.062.769</p>
        </div>
        <div>
          <p className="label mb-4">Product</p>
          <ul className="space-y-2 text-cream/80 text-sm">
            <li><Link href="#how">How it works</Link></li>
            <li><Link href="#dashboard">Dashboard</Link></li>
            <li><Link href="#pricing">Pricing</Link></li>
            <li><Link href="#faq">FAQ</Link></li>
            <li><Link href="/changelog">Changelog</Link></li>
          </ul>
        </div>
        <div>
          <p className="label mb-4">Connect</p>
          <ul className="space-y-2 text-cream/80 text-sm">
            <li><a href="mailto:hello@zholy.com">hello@zholy.com</a></li>
            <li><Link href="/signup">Create account</Link></li>
            <li><Link href="/signin">Sign in</Link></li>
            <li><a href="https://zholy.com">zholy.com</a></li>
            <li><Link href="#hero">Back to top</Link></li>
          </ul>
        </div>
        <div>
          <p className="label mb-4">Legal</p>
          <ul className="space-y-2 text-cream/80 text-sm">
            <li><a href="https://zholy.com/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            <li><a href="https://zholy.com/legal/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
            <li><a href="https://zholy.com/legal/gdpr" target="_blank" rel="noopener noreferrer">GDPR Notice</a></li>
            <li><a href="https://zholy.com/legal/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap mt-16 flex flex-col md:flex-row justify-between gap-4 text-[11px] font-mono tracking-widest text-muted items-center">
        <span>ZHOLY · POLARE GROUP SÀRL · CHE-221.062.769</span>
        <span className="flex items-center gap-3">
          <FooterSwissFlag />
          <span>HOSTED IN SWITZERLAND · GDPR · SWISS nFADP · SOVEREIGN INFRA</span>
        </span>
      </div>
    </footer>
  );
}

/** Inline Swiss flag for the footer — small, crisp. */
function FooterSwissFlag() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Swiss flag"
      role="img"
      style={{ borderRadius: 3, boxShadow: "0 0 0 1px rgba(255,255,255,0.08)" }}
    >
      <rect width="32" height="32" fill="#DA291C" />
      <rect x="6" y="13" width="20" height="6" fill="#FFFFFF" />
      <rect x="13" y="6" width="6" height="20" fill="#FFFFFF" />
    </svg>
  );
}
