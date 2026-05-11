/**
 * Canonical site URL for metadata / footer (must exist in DNS).
 * Do not hardcode voice.* until the subdomain is provisioned.
 */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "https://zholy.com";
}

/**
 * Origin where `/embed/zholy-embed.js` is served (usually the voice gateway).
 * Priority: explicit embed origin → gateway URL → main site.
 */
export function embedScriptOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_ZRO_EMBED_SNIPPET_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_ZRO_GATEWAY_URL?.trim() ||
    siteUrl();
  return raw.replace(/\/$/, "");
}

/** Full `src` value for the customer copy-paste snippet. */
export function embedSnippetSrc(): string {
  const origin = embedScriptOrigin();
  const gateway = process.env.NEXT_PUBLIC_ZRO_GATEWAY_URL?.trim() || origin;
  return `${origin}/embed/zholy-embed.js?gateway=${encodeURIComponent(gateway)}`;
}
