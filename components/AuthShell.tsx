import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen relative overflow-hidden grid place-items-center px-4 py-16"
          style={{ background: "#1C1D22" }}>
      <div className="aurora" />
      <div className="grain" />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center group">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#4CE9E9" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="6" fill="#4CE9E9" opacity="0.15" />
            <circle cx="14" cy="14" r="3" fill="#4CE9E9" />
          </svg>
          <span className="font-serif text-xl text-cream tracking-tight">ZHOLY</span>
        </Link>

        <div style={{ background: "#252628", border: "1px solid rgba(255,255,255,0.08)" }}
             className="rounded-2xl p-8">
          {title && <h1 className="font-serif text-4xl tracking-tighter text-cream mb-2">{title}</h1>}
          {subtitle && <p className="text-cream/50 mb-8 text-sm">{subtitle}</p>}
          {children}
        </div>

        {footer && (
          <div className="text-center mt-6 text-sm text-cream/50">{footer}</div>
        )}
      </div>
    </main>
  );
}
