import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const ENTRIES = [
  { d: "2026-05-01", t: "Initial scaffold", b: "Marketing site, dashboard shell, sign-up flow. ZHOLY public preview." },
];

export default function Changelog() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-20">
        <div className="wrap max-w-3xl">
          <p className="label mb-3">[ Changelog ]</p>
          <h1 className="serif text-5xl tracking-tighter mb-12">Every shipped change.</h1>
          <ul className="divide-y divide-line border-y border-line">
            {ENTRIES.map((e) => (
              <li key={e.d} className="py-8 grid grid-cols-[140px,1fr] gap-6">
                <span className="font-mono text-[11px] tracking-widest text-muted">{e.d}</span>
                <div>
                  <h2 className="serif text-2xl mb-2">{e.t}</h2>
                  <p className="text-cream/70">{e.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
