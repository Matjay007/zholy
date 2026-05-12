# Workload Isolation

**Last updated:** 2026-05-12  
**Status:** NO queue system exists. All work is synchronous in HTTP request cycles.

---

## Current State: No Queues

Every operation — AI inference, email sending, webhook dispatch — runs synchronously inside an HTTP request. This means:

- A slow OpenAI response (5–30s) holds an HTTP connection open for the duration
- A failed webhook has no retry mechanism
- An email failure silently drops the email
- There is no backpressure — traffic spikes flood all operations simultaneously

**This is a launch risk, not a blocker for demo/beta, but will cause outages under real load.**

---

## Required Queue Architecture

The following operations MUST be queued before handling viral traffic:

| Operation | Current | Required | Priority |
|-----------|---------|----------|----------|
| AI inference (LLM) | Sync HTTP | Async queue | **Critical** |
| Email sending | Fire-and-forget nodemailer | Queue + retry | **Critical** |
| TTS generation (long) | Sync HTTP | Async queue | High |
| Webhook dispatch (CRM) | Not implemented | Queue + retry | High |
| Embeddings / knowledge indexing | Sync | Queue + concurrency limit | Medium |
| Lead capture writes | Sync DB write | Queue + batch | Low |
| Billing reconciliation | Not implemented | Scheduled job | Low |

---

## Recommended Queue Stack

Given the current single-server setup, the lowest-friction option is **pg-boss** (PostgreSQL-backed job queue — no additional infrastructure):

```bash
npm install pg-boss
```

This uses the existing PostgreSQL instance. No Redis required. Supports:
- Max concurrency per queue
- Retry with exponential backoff
- Dead-letter queue
- Scheduled jobs
- Priority queues

When/if Redis is added, migrate to BullMQ for lower latency.

---

## Queue Design (When Implemented)

### AI Inference Queue

```typescript
// Queue name: "ai-inference"
// Max concurrency: 20 global, 3 per user
// Timeout: 30s
// Retry: 2 attempts, 5s backoff
// Dead-letter: "ai-inference-dead"
// Backlog limit: 500 jobs (reject new with 503 above this)
```

### Email Queue

```typescript
// Queue name: "email-send"
// Max concurrency: 10
// Timeout: 15s
// Retry: 3 attempts, 10s / 30s / 120s backoff
// Dead-letter: "email-dead"
```

### Webhook Dispatch Queue

```typescript
// Queue name: "webhook-dispatch"
// Max concurrency: 20
// Timeout: 10s
// Retry: 5 attempts, exponential backoff, max 5 min
// Dead-letter: "webhook-dead"
// Visibility timeout: 30s
```

---

## Backpressure Behavior (Required)

When a queue is at capacity:
- Return HTTP 503 with `Retry-After: 30` header
- Log the rejection: `{ event: "queue_full", queue, backlog }`
- Do NOT silently drop the job
- Alert when backlog > 80% of limit

---

## Current Workaround

Until queues are implemented, the rate limiter (middleware) provides crude backpressure:
- 10 auth requests / 60s per IP
- 120 API requests / 60s per IP
- 10 TTS preview requests / 60s per IP

This is insufficient for a real traffic spike but prevents the worst abuse scenarios.
