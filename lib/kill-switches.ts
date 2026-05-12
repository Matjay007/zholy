/**
 * Kill switches — all checked from environment variables.
 * Set any to "true" to engage. No restart required for gateway env changes,
 * but the Next.js process reads these at request time via process.env.
 *
 * To activate: add/change the var in /opt/zholy/.env.local and run:
 *   sudo systemctl restart zholy
 */

export const KillSwitch = {
  /** Disable all AI inference (LLM + TTS + STT) */
  AI_DISABLED: process.env.KILL_AI === "true",

  /** Disable voice session bootstrap */
  VOICE_DISABLED: process.env.KILL_VOICE === "true",

  /** Downgrade all free users to cheapest model */
  FORCE_CHEAP_MODEL: process.env.KILL_PREMIUM_MODEL === "true",

  /** Disable embedding generation and knowledge indexing */
  EMBEDDINGS_DISABLED: process.env.KILL_EMBEDDINGS === "true",

  /** Disable external webhook dispatch */
  WEBHOOKS_DISABLED: process.env.KILL_WEBHOOKS === "true",

  /** Disable background agents */
  BACKGROUND_AGENTS_DISABLED: process.env.KILL_BACKGROUND_AGENTS === "true",

  /** Force waitlist-only mode — no new signups */
  WAITLIST_ONLY: process.env.KILL_SIGNUPS === "true",

  /** Force read-only mode — no writes */
  READ_ONLY: process.env.KILL_WRITES === "true",

  /** Maintenance mode — show maintenance page to all users */
  MAINTENANCE: process.env.KILL_MAINTENANCE === "true",
} as const;

export type KillSwitchKey = keyof typeof KillSwitch;

/** Max concurrent AI jobs globally. 0 = unlimited (not recommended). */
export const AI_MAX_CONCURRENT_GLOBAL = parseInt(
  process.env.AI_MAX_CONCURRENT_GLOBAL || "20",
  10,
);

/** Max concurrent AI jobs per user session. */
export const AI_MAX_CONCURRENT_PER_USER = parseInt(
  process.env.AI_MAX_CONCURRENT_PER_USER || "3",
  10,
);

/** Max tokens per LLM request (input + output). */
export const AI_MAX_TOKENS_PER_REQUEST = parseInt(
  process.env.AI_MAX_TOKENS_PER_REQUEST || "4096",
  10,
);

/** Max conversation context tokens. */
export const AI_MAX_CONTEXT_TOKENS = parseInt(
  process.env.AI_MAX_CONTEXT_TOKENS || "16384",
  10,
);

/** Max tool call depth per agent run. */
export const AI_MAX_TOOL_DEPTH = parseInt(
  process.env.AI_MAX_TOOL_DEPTH || "10",
  10,
);

/** Max duration for a single AI job in milliseconds. */
export const AI_MAX_JOB_MS = parseInt(
  process.env.AI_MAX_JOB_MS || "30000",
  10,
);

/** Daily spend cap in USD cents (0 = no cap). */
export const AI_DAILY_SPEND_CAP_CENTS = parseInt(
  process.env.AI_DAILY_SPEND_CAP_CENTS || "0",
  10,
);
