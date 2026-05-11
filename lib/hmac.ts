import { createHmac } from "crypto";

/**
 * Verify HMAC-SHA256 signature on admin-bridge requests.
 * Header: x-zholy-sig: sha256=<hex>
 */
export function verifyRequest(req: Request, body: string): boolean {
  const key = process.env.ZHOLY_ADMIN_BRIDGE_KEY;
  if (!key) return false;
  const sig = req.headers.get("x-zholy-sig") ?? "";
  const expected = "sha256=" + createHmac("sha256", key).update(body).digest("hex");
  // Constant-time compare
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
