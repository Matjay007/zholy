import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center wrap">
      <div className="text-center">
        <p className="label mb-4">[ 404 ]</p>
        <h1 className="serif text-6xl tracking-tighter mb-4">Wrong door.</h1>
        <p className="text-cream/70 mb-8">That page isn't here. Maybe it never was.</p>
        <Link href="/" className="btn btn-cyan">Back home <span className="btn-arrow">→</span></Link>
      </div>
    </main>
  );
}
