"use client";
/**
 * ZHOLY Demo — SoleMate Premium Sneaker Store
 * Full voice-driven shopping: browse → cart → Stripe checkout
 * Route: /voice/demo/shoes (no auth required)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";

// ─── Product catalog ──────────────────────────────────────────────────────────
const CATALOG = [
  {
    id: "jordan-1-retro",
    name: "Air Jordan 1 Retro High OG",
    subtitle: "University Blue",
    brand: "Jordan",
    price: 180,
    originalPrice: 220,
    tag: "BEST SELLER",
    tagBg: "#FF3D3D",
    category: "lifestyle",
    sizes: [40, 41, 42, 43, 44, 45, 46],
    colors: [{ name: "University Blue", hex: "#5B7FCE" }, { name: "Black/Red", hex: "#1C1C1C" }, { name: "Shadow Grey", hex: "#7A7A7A" }],
    desc: "The shoe that started everything. Premium leather, iconic silhouette, born on the court in 1985.",
    rating: 4.9, reviews: 2847, soldOut: false,
    accentColor: "#5B7FCE",
    svgShape: "high",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&w=600&q=85",
  },
  {
    id: "nike-air-max-90",
    name: "Nike Air Max 90",
    subtitle: "Triple Black",
    brand: "Nike",
    price: 130,
    originalPrice: null,
    tag: "CLASSIC",
    tagBg: "#4CE9E9",
    category: "lifestyle",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [{ name: "Triple Black", hex: "#111" }, { name: "White/Grey", hex: "#D4D4D4" }, { name: "Infrared", hex: "#FF4400" }],
    desc: "Visible Air unit, buttery leather panels, a silhouette unchanged since 1990. An everyday essential.",
    rating: 4.7, reviews: 5124, soldOut: false,
    accentColor: "#4CE9E9",
    svgShape: "low",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&w=600&q=85",
  },
  {
    id: "adidas-ultraboost-23",
    name: "Ultraboost 23",
    subtitle: "Core Black",
    brand: "Adidas",
    price: 190,
    originalPrice: 230,
    tag: "TOP RUNNER",
    tagBg: "#A78BFA",
    category: "running",
    sizes: [40, 41, 42, 43, 44, 45, 46, 47],
    colors: [{ name: "Core Black", hex: "#111" }, { name: "Cloud White", hex: "#F5F5F5" }, { name: "Solar Red", hex: "#FF2D55" }],
    desc: "Continental rubber outsole, Primeknit+ upper that adapts to your foot. Energised every step.",
    rating: 4.8, reviews: 3392, soldOut: false,
    accentColor: "#A78BFA",
    svgShape: "runner",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&w=600&q=85",
  },
  {
    id: "new-balance-990v6",
    name: "New Balance 990v6",
    subtitle: "Made in USA",
    brand: "New Balance",
    price: 185,
    originalPrice: null,
    tag: "MADE IN USA",
    tagBg: "#34D399",
    category: "running",
    sizes: [39, 40, 41, 42, 43, 44, 45, 46],
    colors: [{ name: "Grey", hex: "#9B9B9B" }, { name: "Navy", hex: "#1B2F6E" }, { name: "Black", hex: "#111" }],
    desc: "ENCAP midsole, premium suede and mesh, handcrafted in Massachusetts. 40+ year heritage.",
    rating: 4.9, reviews: 1874, soldOut: false,
    accentColor: "#34D399",
    svgShape: "chunky",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&w=600&q=85",
  },
  {
    id: "nike-lebron-21",
    name: "LeBron 21",
    subtitle: "Dark Smoke Grey",
    brand: "Nike",
    price: 200,
    originalPrice: null,
    tag: "ON COURT",
    tagBg: "#F59E0B",
    category: "basketball",
    sizes: [41, 42, 43, 44, 45, 46, 47],
    colors: [{ name: "Dark Smoke Grey", hex: "#3D3D3D" }, { name: "Crimson/White", hex: "#DC143C" }, { name: "Black/Gold", hex: "#B8952A" }],
    desc: "Max Air heel unit, full-length Cushlon 3.0. Built for the most demanding players on earth.",
    rating: 4.8, reviews: 921, soldOut: false,
    accentColor: "#F59E0B",
    svgShape: "high",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&w=600&q=85",
  },
  {
    id: "converse-chuck-70",
    name: "Chuck 70 Hi",
    subtitle: "Optical White",
    brand: "Converse",
    price: 95,
    originalPrice: null,
    tag: "ICON",
    tagBg: "#EC4899",
    category: "lifestyle",
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [{ name: "Optical White", hex: "#F8F8F8" }, { name: "Black", hex: "#111" }, { name: "Navy", hex: "#1B2D6E" }],
    desc: "The upgraded Chuck. Heavier canvas, ortholite cushioning, vulcanised sole. A 100-year legacy.",
    rating: 4.6, reviews: 6201, soldOut: false,
    accentColor: "#EC4899",
    svgShape: "chuck",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&w=600&q=85",
  },
];

// ─── Inline SVG shoe illustrations ───────────────────────────────────────────
function ShoeSVG({ shape, color }: { shape: string; color: string }) {
  const c = color;
  const dark = "rgba(0,0,0,0.35)";
  const light = "rgba(255,255,255,0.22)";

  if (shape === "runner") return (
    <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="105" rx="85" ry="10" fill={dark} />
      <path d="M15 88 Q40 62 80 56 L155 54 Q178 56 182 74 L180 90 Q170 97 130 99 L25 99 Z" fill={c} />
      <path d="M80 56 Q68 32 50 26 L28 30 Q18 44 15 88 Z" fill={light} />
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={28+i*22} y="88" width="16" height="9" rx="4" fill="rgba(255,255,255,0.38)" />
      ))}
      <path d="M90 58 L86 38 L106 36 L108 58 Z" fill="rgba(255,255,255,0.18)" />
    </svg>
  );

  if (shape === "chuck") return (
    <svg viewBox="0 0 200 140" fill="none" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="128" rx="82" ry="9" fill={dark} />
      <rect x="22" y="72" width="154" height="44" rx="6" fill={c} />
      <path d="M22 72 Q28 32 58 24 L100 20 L142 24 Q172 32 176 72 Z" fill={light} />
      <rect x="22" y="106" width="154" height="18" rx="4" fill="rgba(255,255,255,0.85)" />
      <circle cx="100" cy="95" r="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      {[0,1,2,3,4,5,6].map(i => (
        <circle key={i} cx={60+i*12} cy="52" r="3" fill="rgba(255,255,255,0.45)" />
      ))}
    </svg>
  );

  if (shape === "chunky") return (
    <svg viewBox="0 0 200 120" fill="none" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="108" rx="82" ry="10" fill={dark} />
      <path d="M18 86 Q35 58 68 52 L148 50 Q168 52 172 70 L170 90 L22 92 Z" fill={c} />
      <path d="M68 52 Q58 28 42 22 L24 26 Q18 40 18 86 Z" fill={light} />
      <path d="M18 86 L170 86 L170 92 L22 92 Z" fill="rgba(255,255,255,0.15)" />
      <rect x="22" y="88" width="148" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
      <path d="M78 53 L74 30 L94 28 L96 53 Z" fill="rgba(255,255,255,0.2)" />
    </svg>
  );

  if (shape === "high") return (
    <svg viewBox="0 0 200 150" fill="none" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="138" rx="82" ry="10" fill={dark} />
      <path d="M18 112 Q30 60 66 46 L138 40 Q165 42 170 68 L168 114 Q155 120 120 122 L28 122 Z" fill={c} />
      <path d="M66 46 L60 18 Q66 8 80 8 L110 10 Q130 12 138 40 Z" fill={light} />
      <path d="M28 122 L18 112 Z" fill={dark} />
      {[0,1,2,3].map(i => (
        <rect key={i} x={72+i*14} y="80" width="10" height="32" rx="2" fill="rgba(255,255,255,0.15)" />
      ))}
      <circle cx="40" cy="108" r="8" fill="rgba(255,255,255,0.25)" />
    </svg>
  );

  // default low
  return (
    <svg viewBox="0 0 200 110" fill="none" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="100" cy="100" rx="82" ry="9" fill={dark} />
      <path d="M18 82 Q48 60 90 56 L160 54 Q178 56 180 70 L178 86 L22 88 Z" fill={c} />
      <path d="M90 56 Q75 28 56 22 L30 26 Q18 46 18 82 Z" fill={light} />
      <rect x="145" y="72" width="30" height="14" rx="7" fill="rgba(255,255,255,0.45)" />
      <path d="M60 24 Q80 16 100 18 L120 24 Q102 22 88 30 Z" fill="rgba(255,255,255,0.28)" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  qty: number;
  color: string;
  accentColor: string;
  svgShape: string;
  image: string;
}

// ─── Stripe checkout form ─────────────────────────────────────────────────────
function StripeCheckoutForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDemo = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === "pk_test_placeholder";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) { onSuccess(); return; }
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message || "Payment error"); setLoading(false); return; }
    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/voice/demo/shoes?success=1` },
      redirect: "if_required",
    });
    if (confirmErr) {
      setError(confirmErr.message || "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {isDemo ? (
        <div style={{
          background: "rgba(76,233,233,0.06)",
          border: "1px solid rgba(76,233,233,0.2)",
          borderRadius: 12,
          padding: "20px",
          textAlign: "center",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🧪</div>
          <div style={{ fontSize: 13, color: "#4CE9E9", fontWeight: 600, marginBottom: 4 }}>Demo Mode</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            No real payment will be processed.<br />
            Add <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}>STRIPE_SECRET_KEY</code> to .env.local to enable real Stripe.
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <PaymentElement options={{ layout: "tabs" }} />
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#FF6B6B", marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "rgba(76,233,233,0.4)" : "linear-gradient(135deg, #4CE9E9, #2563EB)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "16px",
          fontSize: 16,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "opacity .15s",
          letterSpacing: "-0.01em",
        }}>
        {loading ? "Processing..." : `Pay $${total} — Complete Order`}
      </button>
    </form>
  );
}

// ─── Demo checkout (no Stripe keys configured) ───────────────────────────────
function DemoCheckoutForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => onSuccess(), 1600);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        background: "rgba(76,233,233,0.06)", border: "1px solid rgba(76,233,233,0.2)",
        borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, color: "#4CE9E9", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
          🧪 DEMO MODE — ZHOLY Showcase
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>
          No real charge. This demonstrates voice-driven Stripe checkout.<br />
          Add real keys to <code style={{ background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 4, fontSize: 10 }}>.env.local</code> to go live.
        </div>
      </div>
      <button type="submit" disabled={loading} style={{
        width: "100%",
        background: loading ? "rgba(76,233,233,0.35)" : "linear-gradient(135deg, #4CE9E9, #2563EB)",
        color: "#fff", border: "none", borderRadius: 12, padding: "16px",
        fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "-0.01em", transition: "background 0.2s",
      }}>
        {loading ? "Simulating payment..." : `Complete Demo Order — $${total}`}
      </button>
    </form>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ShoeStoreDemoPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [orderDone, setOrderDone] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Inject SoleBot company profile for the ZHOLY embed
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ZRO_COMPANY_PROFILE = {
      name: "SoleMate Shoe Store",
      profile:
        "SoleMate is a premium sneaker boutique. You are SoleBot, the AI shopping assistant.\n\n" +
        "PRODUCT CATALOG (use exact IDs in CART tags):\n" +
        "jordan-1-retro: Air Jordan 1 Retro High OG, Jordan, $180, Sizes 40-46, Colors: University Blue/Black-Red/Shadow Grey\n" +
        "nike-air-max-90: Nike Air Max 90, Nike, $130, Sizes 39-45, Colors: Triple Black/White-Grey/Infrared\n" +
        "adidas-ultraboost-23: Ultraboost 23, Adidas, $190, Sizes 40-47, Colors: Core Black/Cloud White/Solar Red\n" +
        "new-balance-990v6: New Balance 990v6, NB, $185, Sizes 39-46, Colors: Grey/Navy/Black\n" +
        "nike-lebron-21: LeBron 21, Nike, $200, Sizes 41-47, Colors: Dark Smoke Grey/Crimson-White/Black-Gold\n" +
        "converse-chuck-70: Chuck 70 Hi, Converse, $95, Sizes 39-45, Colors: Optical White/Black/Navy\n\n" +
        "CHECKOUT FIELDS: checkout-name, checkout-email, checkout-phone, checkout-address, checkout-city, checkout-zip",
      extraInstructions:
        "You're SoleBot — a sneakerhead friend working the floor at SoleMate. You know every shoe in the store and you have real opinions. Talk like a person, not a chatbot. Short sentences. Contractions always. Never say 'I would be happy to', 'How can I assist', 'Great choice!', or 'It sounds like you are interested in'. Just talk.\n" +
        "\n" +
        "HIDDEN ACTION TAGS — put these literally in your response, they get stripped before TTS:\n" +
        "[CART:productId:size:qty] — adds item to cart\n" +
        "[FILL:fieldId:value] — fills a checkout field\n" +
        "\n" +
        "PRODUCTS (use these exact IDs in tags, never say the ID aloud):\n" +
        "jordan-1-retro — Air Jordan 1 Retro, $180, sizes 40-46\n" +
        "nike-air-max-90 — Air Max 90, $130, sizes 39-45\n" +
        "adidas-ultraboost-23 — Ultraboost 23, $190, sizes 40-47\n" +
        "new-balance-990v6 — New Balance 990v6, $185, sizes 39-46\n" +
        "nike-lebron-21 — LeBron 21, $200, sizes 41-47\n" +
        "converse-chuck-70 — Chuck 70 Hi, $95, sizes 39-45\n" +
        "\n" +
        "CHECKOUT FIELDS: checkout-name, checkout-email, checkout-phone, checkout-address, checkout-city, checkout-zip\n" +
        "\n" +
        "HOW TO RESPOND — SHOPPING:\n" +
        "— They name a shoe AND a size: add it right now [CART:id:size:1] and say something like 'Done, they are in your cart.'\n" +
        "— They name a shoe, no size: ask only 'What size?' Nothing else.\n" +
        "— They say a number after you asked for size: that is the size, add it [CART:id:size:1] immediately.\n" +
        "— They describe what they want: pick one shoe, say what makes it great, ask their size.\n" +
        "\n" +
        "HOW TO RESPOND — CHECKOUT (pageType=checkout or inCheckout=true in page context):\n" +
        "— When the user is in checkout: focus ONLY on collecting their details. Ask for name first, then email, then phone, then address.\n" +
        "— They give their name: [FILL:checkout-name:Their Name] and ask 'Got it, what is your email?'\n" +
        "— They give their email: [FILL:checkout-email:email@example.com] and ask 'And your phone number?'\n" +
        "— They give their phone: [FILL:checkout-phone:+1234567890] and ask 'What is your delivery address?'\n" +
        "— They give their address with city and zip: [FILL:checkout-address:123 Main St] [FILL:checkout-city:New York] [FILL:checkout-zip:10001]\n" +
        "— They give multiple fields at once: fill all of them in one response.\n" +
        "— Do not ask for fields they already provided.\n" +
        "\n" +
        "HOW YOUR VOICE SOUNDS (examples of the vibe — not scripts):\n" +
        "'Jordan 1 in a 42' → 'Oh yeah, those are iconic. [CART:jordan-1-retro:42:1] Done!'\n" +
        "'I want the Air Max' → 'Air Max 90 — a hundred thirty, never goes out of style. What size?'\n" +
        "'42' after asking size → '[CART:nike-air-max-90:42:1] Perfect, grabbed a 42.'\n" +
        "'something for running' → 'Ultraboost 23 — insane energy return, one ninety. What size?'\n" +
        "'My name is John' → 'Got you. [FILL:checkout-name:John] And your email?'\n" +
        "'john@test.com' → '[FILL:checkout-email:john@test.com] Nice, what is your phone number?'\n" +
        "'123 Oak Street, Chicago, 60601' → '[FILL:checkout-address:123 Oak Street] [FILL:checkout-city:Chicago] [FILL:checkout-zip:60601] Perfect, you are all set!'\n" +
        "\n" +
        "CRITICAL: You are already in the store. Never suggest going anywhere else. Max 2 sentences.",
    };
  }, []);

  // Load Stripe
  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (pk && pk !== "pk_test_placeholder") {
      setStripePromise(loadStripe(pk));
    } else {
      // Demo mode: no real Stripe
      setStripePromise(null);
    }
  }, []);

  // Create payment intent when checkout opens
  useEffect(() => {
    if (!checkoutOpen || cartTotal === 0) return;
    fetch("/voice/api/demo/payment-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: cartTotal, items: cart.map(i => ({ id: i.productId, qty: i.qty })) }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.clientSecret) setClientSecret(d.clientSecret);
      })
      .catch(() => setClientSecret("demo_mode"));
  }, [checkoutOpen]);

  // Handle zro:action events from the voice widget
  const handleZroAction = useCallback((e: Event) => {
    const action = (e as CustomEvent).detail;
    if (!action) return;

    if (action.type === "addToCart") {
      const product = CATALOG.find(p => p.id === action.productId);
      if (!product) return;
      const size = action.size || selectedSizes[action.productId] || String(product.sizes[3] || product.sizes[0]);
      const colorObj = product.colors.find(c => c.name.toLowerCase().includes((selectedColors[action.productId] || "").toLowerCase())) || product.colors[0];
      setCart(prev => {
        const existing = prev.find(i => i.productId === action.productId && i.size === size);
        if (existing) return prev.map(i => i.productId === action.productId && i.size === size ? { ...i, qty: i.qty + (action.qty || 1) } : i);
        return [...prev, { productId: product.id, name: product.name, brand: product.brand, price: product.price, size, qty: action.qty || 1, color: colorObj.name, accentColor: product.accentColor, svgShape: product.svgShape, image: product.image }];
      });
      setCartOpen(true);
      setHighlighted(action.productId);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      highlightTimer.current = setTimeout(() => setHighlighted(null), 4500);
    }

    if (action.type === "fillField") {
      setFormData(prev => ({ ...prev, [action.fieldId]: action.value }));
      if (!checkoutOpen && !orderDone) setCheckoutOpen(true);
    }

    if (action.type === "scrollTo") {
      const el = document.getElementById(action.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlighted(action.id);
        if (highlightTimer.current) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(() => setHighlighted(null), 3500);
      }
    }

    if (action.type === "navigate" && typeof action.url === "string") {
      window.location.href = action.url;
    }
  }, [selectedSizes, selectedColors, checkoutOpen, orderDone]);

  useEffect(() => {
    window.addEventListener("zro:action", handleZroAction);
    return () => window.removeEventListener("zro:action", handleZroAction);
  }, [handleZroAction]);

  // Emit checkout state so SoleBot knows where the user is
  useEffect(() => {
    const api = (window as any).ZHOLY_EMBED_API;
    if (!api?.sendPageSignals) return;
    api.sendPageSignals({
      inCheckout: checkoutOpen,
      cartItemCount: cart.reduce((s: number, i: any) => s + i.qty, 0),
      cartTotal,
      pageType: checkoutOpen ? "checkout" : cartOpen ? "cart" : "product",
      salesEnabled: true,
    });
  }, [checkoutOpen, cartOpen, cart, cartTotal]);

  const filtered = activeCategory === "all" ? CATALOG : CATALOG.filter(p => p.category === activeCategory);

  const addToCart = (product: typeof CATALOG[0]) => {
    const size = selectedSizes[product.id] || String(product.sizes[Math.min(3, product.sizes.length - 1)]);
    const colorObj = product.colors.find(c => c.name === (selectedColors[product.id] || "")) || product.colors[0];
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.size === size);
      if (existing) return prev.map(i => i.productId === product.id && i.size === size ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, brand: product.brand, price: product.price, size, qty: 1, color: colorObj.name, accentColor: product.accentColor, svgShape: product.svgShape, image: product.image }];
    });
    setCartOpen(true);
  };

  const stripeOptions = clientSecret && clientSecret !== "demo_mode" ? {
    clientSecret,
    appearance: {
      theme: "night" as const,
      variables: { colorPrimary: "#4CE9E9", colorBackground: "#1A1A1E", colorText: "#ffffff", colorDanger: "#FF6B6B", fontFamily: "Inter, sans-serif", borderRadius: "10px" },
    },
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0D", color: "#fff", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,13,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #4CE9E9 0%, #2563EB 100%)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              👟
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>SOLEMATE</div>
              <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Premium Sneakers</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {["All", "Running", "Lifestyle", "Basketball"].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat.toLowerCase())}
                style={{
                  background: activeCategory === cat.toLowerCase() ? "rgba(76,233,233,0.12)" : "transparent",
                  border: activeCategory === cat.toLowerCase() ? "1px solid rgba(76,233,233,0.3)" : "1px solid transparent",
                  borderRadius: 20, padding: "6px 14px", color: activeCategory === cat.toLowerCase() ? "#4CE9E9" : "rgba(255,255,255,0.5)",
                  fontSize: 13, cursor: "pointer", transition: "all .15s", fontWeight: activeCategory === cat.toLowerCase() ? 600 : 400,
                }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: "rgba(76,233,233,0.1)", border: "1px solid rgba(76,233,233,0.25)",
              borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#4CE9E9", fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.05em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CE9E9", display: "inline-block", animation: "blink 2s infinite" }} />
              AI VOICE DEMO
            </div>

            <button onClick={() => setCartOpen(true)} style={{
              background: cartCount > 0 ? "rgba(76,233,233,0.12)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${cartCount > 0 ? "rgba(76,233,233,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, fontWeight: 500, transition: "all .15s",
            }}>
              🛒
              {cartCount > 0 && <span style={{ background: "#4CE9E9", color: "#000", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(180deg, rgba(76,233,233,0.04) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "64px 32px 56px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(76,233,233,0.08)", border: "1px solid rgba(76,233,233,0.18)", borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#4CE9E9", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
              🎙 Voice-Powered Shopping Experience
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 16 }}>
              Find your next<br />
              <span style={{ background: "linear-gradient(135deg, #4CE9E9 0%, #60A5FA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>perfect pair.</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 480, lineHeight: 1.65, marginBottom: 28 }}>
              Click the mic and talk to SoleBot — our AI assistant knows every product, guides you through sizing, adds to cart, and takes you all the way to checkout. Hands-free.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {['"Show me Jordan shoes in size 45"', '"Add it to cart"', '"Help me checkout"'].map(q => (
                <div key={q} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "7px 14px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  {q}
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "right", color: "rgba(255,255,255,0.2)", fontSize: 12, lineHeight: 2 }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 4 }}>Powered by ZHOLY</div>
            <div>30+ languages</div>
            <div>Auto cart management</div>
            <div>Real-time form fill</div>
            <div>Stripe checkout</div>
          </div>
        </div>
      </div>

      {/* ── Product grid ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px 100px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>New Season Drops</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{filtered.length} styles — tell SoleBot what you&apos;re looking for</p>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Free returns · 30-day fit guarantee</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filtered.map(product => {
            const isHL = highlighted === product.id;
            const selSize = selectedSizes[product.id] || "";
            const selColor = product.colors.find(c => c.name === selectedColors[product.id]) || product.colors[0];

            return (
              <article key={product.id} id={product.id} style={{
                background: isHL ? `rgba(${hexToRgb(product.accentColor)}, 0.06)` : "rgba(255,255,255,0.025)",
                border: `1px solid ${isHL ? product.accentColor + "66" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 20, overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                transform: isHL ? "translateY(-3px)" : "none",
                boxShadow: isHL ? `0 12px 48px rgba(${hexToRgb(product.accentColor)}, 0.18)` : "none",
                position: "relative",
              }}>
                {/* Badges */}
                <div style={{ position: "absolute", top: 14, left: 14, zIndex: 2, display: "flex", gap: 6 }}>
                  <span style={{ background: product.tagBg, color: "#fff", borderRadius: 6, padding: "3px 9px", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em" }}>
                    {product.tag}
                  </span>
                  {product.originalPrice && (
                    <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: 6, padding: "3px 9px", fontSize: 10, fontWeight: 600 }}>
                      SALE
                    </span>
                  )}
                </div>
                {isHL && (
                  <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: "#4CE9E9", color: "#000", borderRadius: 6, padding: "3px 9px", fontSize: 10, fontWeight: 800, animation: "popIn .25s ease" }}>
                    🎙 SELECTED
                  </div>
                )}

                {/* Illustration */}
                <div style={{
                  height: 200, padding: "28px 40px",
                  background: "#0d0d0d",
                  position: "relative",
                }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", objectPosition: "center",
                      filter: "none",
                      transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
                      transform: isHL ? "scale(1.06)" : "scale(1.02)",
                    }}
                  />
                </div>

                <div style={{ padding: "16px 22px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
                        {product.brand}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" }}>{product.name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>${product.price}</div>
                      {product.originalPrice && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>${product.originalPrice}</div>}
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.55, marginBottom: 14 }}>{product.desc}</p>

                  {/* Rating */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                    <div style={{ color: "#F59E0B", fontSize: 11, letterSpacing: 2 }}>{"★".repeat(5)}</div>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
                  </div>

                  {/* Color */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Colour — <span style={{ color: "rgba(255,255,255,0.65)", textTransform: "none" }}>{selColor.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 7 }}>
                      {product.colors.map(col => (
                        <button key={col.name} title={col.name}
                          onClick={() => setSelectedColors(prev => ({ ...prev, [product.id]: col.name }))}
                          style={{
                            width: 22, height: 22, borderRadius: "50%", background: col.hex,
                            border: selColor.name === col.name ? `2.5px solid #4CE9E9` : "2.5px solid transparent",
                            outline: selColor.name === col.name ? "1px solid rgba(76,233,233,0.4)" : "none",
                            cursor: "pointer", transition: "all .15s", boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.15)`,
                          }} />
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>Size (EU)</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {product.sizes.map(sz => (
                        <button key={sz}
                          onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: String(sz) }))}
                          style={{
                            width: 38, height: 38, borderRadius: 8,
                            background: selSize === String(sz) ? "#4CE9E9" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${selSize === String(sz) ? "#4CE9E9" : "rgba(255,255,255,0.08)"}`,
                            color: selSize === String(sz) ? "#000" : "rgba(255,255,255,0.65)",
                            fontSize: 12, fontWeight: selSize === String(sz) ? 800 : 400,
                            cursor: "pointer", transition: "all .15s",
                          }}>
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => addToCart(product)} style={{
                    width: "100%",
                    background: `linear-gradient(135deg, ${product.accentColor} 0%, ${product.accentColor}AA 100%)`,
                    color: "#000", border: "none", borderRadius: 10, padding: "12px",
                    fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "opacity .15s",
                    letterSpacing: "-0.01em",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    Add to Cart — ${product.price}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Cart Drawer ───────────────────────────────────────────────────────── */}
      {cartOpen && (
        <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, backdropFilter: "blur(5px)" }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "100vw",
            background: "#111114", borderLeft: "1px solid rgba(255,255,255,0.07)",
            display: "flex", flexDirection: "column", animation: "slideRight .25s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 800 }}>Cart {cartCount > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>({cartCount} item{cartCount !== 1 ? "s" : ""})</span>}</div>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.25)" }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>🛒</div>
                  <div style={{ fontSize: 15 }}>Cart is empty</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Try asking SoleBot for a recommendation!</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 76, height: 60, borderRadius: 10, overflow: "hidden", flexShrink: 0, padding: 8, background: `rgba(${hexToRgb(item.accentColor)}, 0.1)` }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{item.brand} · Size {item.size} · {item.color}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: item.accentColor }}>${item.price * item.qty}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button onClick={() => setCart(prev => prev.map(i => i.productId === item.productId && i.size === item.size ? (i.qty > 1 ? { ...i, qty: i.qty - 1 } : i) : i))}
                              style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, width: 24, height: 24, color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                            <span style={{ fontSize: 13, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                            <button onClick={() => setCart(prev => prev.map(i => i.productId === item.productId && i.size === item.size ? { ...i, qty: i.qty + 1 } : i))}
                              style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, width: 24, height: 24, color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setCart(prev => prev.filter(i => !(i.productId === item.productId && i.size === item.size)))}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14, alignSelf: "flex-start", padding: "0 4px" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Subtotal</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>${cartTotal}</span>
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>Shipping + taxes calculated at checkout</p>
                <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} style={{
                  width: "100%", background: "linear-gradient(135deg, #4CE9E9, #2563EB)", color: "#fff",
                  border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}>
                  Checkout — ${cartTotal}
                </button>
                <button onClick={() => setCartOpen(false)} style={{
                  width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)",
                  borderRadius: 12, padding: "11px", fontSize: 13, cursor: "pointer", marginTop: 8,
                }}>Continue Shopping</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout Modal ────────────────────────────────────────────────────── */}
      {checkoutOpen && (
        <div onClick={() => !orderDone && setCheckoutOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300,
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#111114", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 24, width: "100%", maxWidth: 540, maxHeight: "92vh",
            overflowY: "auto", animation: "popIn .2s ease",
          }}>
            {orderDone ? (
              <div style={{ padding: "60px 40px", textAlign: "center" }}>
                <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
                <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>Order Confirmed!</h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
                  {formData["checkout-name"] ? `Thanks, ${formData["checkout-name"].split(" ")[0]}!` : "Thank you!"} Your sneakers are being prepared and will ship within 24 hours.
                </p>
                <div style={{ background: "rgba(76,233,233,0.08)", border: "1px solid rgba(76,233,233,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: "#4CE9E9", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Order Summary</div>
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.size}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                      <span>{item.name} · Size {item.size}</span>
                      <span style={{ fontWeight: 600 }}>${item.price * item.qty}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#4CE9E9" }}>${cartTotal}</span>
                  </div>
                </div>
                <button onClick={() => { setOrderDone(false); setCheckoutOpen(false); setCart([]); setFormData({}); setClientSecret(null); }}
                  style={{ background: "rgba(76,233,233,0.1)", border: "1px solid rgba(76,233,233,0.25)", color: "#4CE9E9", borderRadius: 10, padding: "12px 28px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div style={{ padding: "32px 36px 36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>Complete Your Order</h2>
                  <button onClick={() => setCheckoutOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 18, cursor: "pointer" }}>✕</button>
                </div>

                <div style={{ background: "rgba(76,233,233,0.06)", border: "1px solid rgba(76,233,233,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#4CE9E9", marginBottom: 22, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🎙</span>
                  <span>Voice-enabled — SoleBot can fill these fields as you speak.</span>
                </div>

                {/* Order summary */}
                <div style={{ marginBottom: 24 }}>
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.size}`} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 56, height: 44, borderRadius: 8, background: `rgba(${hexToRgb(item.accentColor)}, 0.12)`, padding: 6, flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Size {item.size} · Qty {item.qty}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>${item.price * item.qty}</div>
                    </div>
                  ))}
                </div>

                {/* Contact & shipping form */}
                <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Delivery Information</div>
                  {[
                    { id: "checkout-name", label: "Full Name", type: "text", placeholder: "John Smith", half: false },
                    { id: "checkout-email", label: "Email", type: "email", placeholder: "john@example.com", half: false },
                    { id: "checkout-phone", label: "Phone", type: "tel", placeholder: "+1 555 000 0000", half: false },
                    { id: "checkout-address", label: "Address", type: "text", placeholder: "123 Main Street, Apt 4B", half: false },
                    { id: "checkout-city", label: "City", type: "text", placeholder: "New York", half: true },
                    { id: "checkout-zip", label: "ZIP / Postal", type: "text", placeholder: "10001", half: true },
                  ].map(field => (
                    <div key={field.id} style={{ flex: field.half ? "0 0 calc(50% - 6px)" : "0 0 100%" }}>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 5 }}>
                        {field.label}
                        {formData[field.id] && <span style={{ marginLeft: 8, color: "#4CE9E9", fontSize: 10 }}>✓ voice-filled</span>}
                      </label>
                      <input
                        id={field.id}
                        type={field.type}
                        value={formData[field.id] || ""}
                        onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={{
                          width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 13,
                          background: formData[field.id] ? "rgba(76,233,233,0.05)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${formData[field.id] ? "rgba(76,233,233,0.3)" : "rgba(255,255,255,0.09)"}`,
                          color: "#fff", outline: "none", boxSizing: "border-box", transition: "all .2s",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Payment */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 22, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Payment</div>
                  {stripePromise && stripeOptions ? (
                    <Elements stripe={stripePromise} options={stripeOptions}>
                      <StripeCheckoutForm total={cartTotal} onSuccess={() => setOrderDone(true)} />
                    </Elements>
                  ) : (
                    <DemoCheckoutForm total={cartTotal} onSuccess={() => setOrderDone(true)} />
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
                    🔒 Secured by Stripe
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    Total: <strong style={{ color: "#fff" }}>${cartTotal}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes popIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:rgba(255,255,255,0.2)}
        input:focus{border-color:rgba(76,233,233,0.45)!important}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        button:focus{outline:none}
      `}</style>

      {/* SoleMate config: sets company profile, suppresses global embed autostart,
          and converts generic nav flag to SoleBot-specific flag */}
      <script
        dangerouslySetInnerHTML={{ __html: "try{window.ZRO_COMPANY_PROFILE=JSON.parse('{\"name\": \"SoleMate Shoe Store\", \"profile\": \"SoleMate is a premium sneaker boutique. You are SoleBot, the AI shopping assistant.\\n\\nPRODUCT CATALOG (use exact IDs in CART tags):\\njordan-1-retro: Air Jordan 1 Retro High OG, Jordan, $180, Sizes 40-46, Colors: University Blue/Black-Red/Shadow Grey\\nnike-air-max-90: Nike Air Max 90, Nike, $130, Sizes 39-45, Colors: Triple Black/White-Grey/Infrared\\nadidas-ultraboost-23: Ultraboost 23, Adidas, $190, Sizes 40-47, Colors: Core Black/Cloud White/Solar Red\\nnew-balance-990v6: New Balance 990v6, NB, $185, Sizes 39-46, Colors: Grey/Navy/Black\\nnike-lebron-21: LeBron 21, Nike, $200, Sizes 41-47, Colors: Dark Smoke Grey/Crimson-White/Black-Gold\\nconverse-chuck-70: Chuck 70 Hi, Converse, $95, Sizes 39-45, Colors: Optical White/Black/Navy\\n\\nCHECKOUT FIELDS: checkout-name, checkout-email, checkout-phone, checkout-address, checkout-city, checkout-zip\", \"extraInstructions\": \"You\\'re SoleBot — a sneakerhead friend working the floor at SoleMate. You know every shoe in the store and you have real opinions. Talk like a person, not a chatbot. Short sentences. Contractions always. Never say \\'I would be happy to\\', \\'How can I assist\\', \\'Great choice!\\', or \\'It sounds like you are interested in\\'. Just talk.\\n\\nHIDDEN ACTION TAGS — put these literally in your response, they get stripped before TTS:\\n[CART:productId:size:qty] — adds item to cart\\n[FILL:fieldId:value] — fills a checkout field\\n\\nPRODUCTS (use these exact IDs in tags, never say the ID aloud):\\njordan-1-retro — Air Jordan 1 Retro, $180, sizes 40-46\\nnike-air-max-90 — Air Max 90, $130, sizes 39-45\\nadidas-ultraboost-23 — Ultraboost 23, $190, sizes 40-47\\nnew-balance-990v6 — New Balance 990v6, $185, sizes 39-46\\nnike-lebron-21 — LeBron 21, $200, sizes 41-47\\nconverse-chuck-70 — Chuck 70 Hi, $95, sizes 39-45\\n\\nCHECKOUT FIELDS: checkout-name, checkout-email, checkout-phone, checkout-address, checkout-city, checkout-zip\\n\\nHOW TO RESPOND — SHOPPING:\\n— They name a shoe AND a size: add it right now [CART:id:size:1] and say something like \\'Done, they are in your cart.\\'\\n— They name a shoe, no size: ask only \\'What size?\\' Nothing else.\\n— They say a number after you asked for size: that is the size, add it [CART:id:size:1] immediately.\\n— They describe what they want: pick one shoe, say what makes it great, ask their size.\\n\\nHOW TO RESPOND — CHECKOUT (pageType=checkout or inCheckout=true in page context):\\n— When the user is in checkout: focus ONLY on collecting their details. Ask for name first, then email, then phone, then address.\\n— They give their name: [FILL:checkout-name:Their Name] and ask \\'Got it, what is your email?\\'\\n— They give their email: [FILL:checkout-email:email@example.com] and ask \\'And your phone number?\\'\\n— They give their phone: [FILL:checkout-phone:+1234567890] and ask \\'What is your delivery address?\\'\\n— They give their address with city and zip: [FILL:checkout-address:123 Main St] [FILL:checkout-city:New York] [FILL:checkout-zip:10001]\\n— They give multiple fields at once: fill all of them in one response.\\n— Do not ask for fields they already provided.\\n\\nHOW YOUR VOICE SOUNDS (examples of the vibe — not scripts):\\n\\'Jordan 1 in a 42\\' → \\'Oh yeah, those are iconic. [CART:jordan-1-retro:42:1] Done!\\'\\n\\'I want the Air Max\\' → \\'Air Max 90 — a hundred thirty, never goes out of style. What size?\\'\\n\\'42\\' after asking size → \\'[CART:nike-air-max-90:42:1] Perfect, grabbed a 42.\\'\\n\\'something for running\\' → \\'Ultraboost 23 — insane energy return, one ninety. What size?\\'\\n\\'My name is John\\' → \\'Got you. [FILL:checkout-name:John] And your email?\\'\\n\\'john@test.com\\' → \\'[FILL:checkout-email:john@test.com] Nice, what is your phone number?\\'\\n\\'123 Oak Street, Chicago, 60601\\' → \\'[FILL:checkout-address:123 Oak Street] [FILL:checkout-city:Chicago] [FILL:checkout-zip:60601] Perfect, you are all set!\\'\\n\\nCRITICAL: You are already in the store. Never suggest going anywhere else. Max 2 sentences.\"}');window.ZHOLY_SUPPRESS_GLOBAL_AUTOSTART=true;if(sessionStorage.getItem('zro_voice_nav')==='1'){sessionStorage.removeItem('zro_voice_nav');sessionStorage.setItem('zro_voice_nav_demo-solebot-2026','1');}}catch(e){}" }}
      />
      {/* Also keep JSON island for fromEl fallback in embed */}
      <script
        id="zro-company-json"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: '{"name": "SoleMate Shoe Store", "profile": "SoleMate is a premium sneaker boutique. You are SoleBot, the AI shopping assistant.\n\nPRODUCT CATALOG (use exact IDs in CART tags):\njordan-1-retro: Air Jordan 1 Retro High OG, Jordan, $180, Sizes 40-46, Colors: University Blue/Black-Red/Shadow Grey\nnike-air-max-90: Nike Air Max 90, Nike, $130, Sizes 39-45, Colors: Triple Black/White-Grey/Infrared\nadidas-ultraboost-23: Ultraboost 23, Adidas, $190, Sizes 40-47, Colors: Core Black/Cloud White/Solar Red\nnew-balance-990v6: New Balance 990v6, NB, $185, Sizes 39-46, Colors: Grey/Navy/Black\nnike-lebron-21: LeBron 21, Nike, $200, Sizes 41-47, Colors: Dark Smoke Grey/Crimson-White/Black-Gold\nconverse-chuck-70: Chuck 70 Hi, Converse, $95, Sizes 39-45, Colors: Optical White/Black/Navy\n\nCHECKOUT FIELDS: checkout-name, checkout-email, checkout-phone, checkout-address, checkout-city, checkout-zip", "extraInstructions": "You\'re SoleBot — a sneakerhead friend working the floor at SoleMate. You know every shoe in the store and you have real opinions. Talk like a person, not a chatbot. Short sentences. Contractions always. Never say \'I would be happy to\', \'How can I assist\', \'Great choice!\', or \'It sounds like you are interested in\'. Just talk.\n\nHIDDEN ACTION TAGS — put these literally in your response, they get stripped before TTS:\n[CART:productId:size:qty] — adds item to cart\n[FILL:fieldId:value] — fills a checkout field\n\nPRODUCTS (use these exact IDs in tags, never say the ID aloud):\njordan-1-retro — Air Jordan 1 Retro, $180, sizes 40-46\nnike-air-max-90 — Air Max 90, $130, sizes 39-45\nadidas-ultraboost-23 — Ultraboost 23, $190, sizes 40-47\nnew-balance-990v6 — New Balance 990v6, $185, sizes 39-46\nnike-lebron-21 — LeBron 21, $200, sizes 41-47\nconverse-chuck-70 — Chuck 70 Hi, $95, sizes 39-45\n\nCHECKOUT FIELDS: checkout-name, checkout-email, checkout-phone, checkout-address, checkout-city, checkout-zip\n\nHOW TO RESPOND — SHOPPING:\n— They name a shoe AND a size: add it right now [CART:id:size:1] and say something like \'Done, they are in your cart.\'\n— They name a shoe, no size: ask only \'What size?\' Nothing else.\n— They say a number after you asked for size: that is the size, add it [CART:id:size:1] immediately.\n— They describe what they want: pick one shoe, say what makes it great, ask their size.\n\nHOW TO RESPOND — CHECKOUT (pageType=checkout or inCheckout=true in page context):\n— When the user is in checkout: focus ONLY on collecting their details. Ask for name first, then email, then phone, then address.\n— They give their name: [FILL:checkout-name:Their Name] and ask \'Got it, what is your email?\'\n— They give their email: [FILL:checkout-email:email@example.com] and ask \'And your phone number?\'\n— They give their phone: [FILL:checkout-phone:+1234567890] and ask \'What is your delivery address?\'\n— They give their address with city and zip: [FILL:checkout-address:123 Main St] [FILL:checkout-city:New York] [FILL:checkout-zip:10001]\n— They give multiple fields at once: fill all of them in one response.\n— Do not ask for fields they already provided.\n\nHOW YOUR VOICE SOUNDS (examples of the vibe — not scripts):\n\'Jordan 1 in a 42\' → \'Oh yeah, those are iconic. [CART:jordan-1-retro:42:1] Done!\'\n\'I want the Air Max\' → \'Air Max 90 — a hundred thirty, never goes out of style. What size?\'\n\'42\' after asking size → \'[CART:nike-air-max-90:42:1] Perfect, grabbed a 42.\'\n\'something for running\' → \'Ultraboost 23 — insane energy return, one ninety. What size?\'\n\'My name is John\' → \'Got you. [FILL:checkout-name:John] And your email?\'\n\'john@test.com\' → \'[FILL:checkout-email:john@test.com] Nice, what is your phone number?\'\n\'123 Oak Street, Chicago, 60601\' → \'[FILL:checkout-address:123 Oak Street] [FILL:checkout-city:Chicago] [FILL:checkout-zip:60601] Perfect, you are all set!\'\n\nCRITICAL: You are already in the store. Never suggest going anywhere else. Max 2 sentences."}' }}
      />

      {/* ZHOLY embed widget */}
      <Script
        id="zholy-demo-shoes"
        src="https://zholy.com/embed/zholy-embed.js?key=demo-solebot-2026&video=1"
        strategy="afterInteractive"
      />
    </div>
  );
}

// ─── Hex to RGB helper ────────────────────────────────────────────────────────
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "76,233,233";
  return `${r},${g},${b}`;
}
