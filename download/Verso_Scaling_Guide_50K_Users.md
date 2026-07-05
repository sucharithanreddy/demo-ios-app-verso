# Verso - Scaling Guide for 50K Users

> **Reference Document** - Use this when you're ready to scale

---

## 📊 **Current State vs 50K Users**

| Component | Current | For 50K Users |
|-----------|---------|---------------|
| **Hosting** | Railway (free) | Railway Pro / AWS ECS |
| **Database** | Neon (free) | Neon Pro / RDS |
| **AI Cost** | Pay per use | ~$500-1000/month |
| **Auth** | Clerk (free) | Clerk Pro |
| **Cache** | None | Redis (Upstash) |
| **Est. Monthly Cost** | $0-20 | $300-500 |

---

## 🏗️ **Architecture Changes Needed**

### 1. Add Redis Caching (Priority: HIGH)

**File:** `src/lib/cache.ts`
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Cache AI responses for 1 hour
export async function getCachedAIResponse(query: string) {
  const key = `ai:${Buffer.from(query).toString('base64').slice(0, 50)}`;
  const cached = await redis.get(key);
  if (cached) return cached;
  return null;
}

export async function setCachedAIResponse(query: string, response: string) {
  const key = `ai:${Buffer.from(query).toString('base64').slice(0, 50)}`;
  await redis.set(key, response, { ex: 3600 }); // 1 hour
}
```

**Install:** `bun add @upstash/redis`

**Env vars needed:**
```
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx
```

---

### 2. Switch to Cheaper AI Models (Priority: HIGH)

**File:** `src/lib/ai-router.ts`
```typescript
import Groq from 'groq-sdk';
import MistralClient from '@mistralai/mistralai';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistral = new MistralClient({ apiKey: process.env.MISTRAL_API_KEY });

export async function generateResponse(query: string, userPlan: 'FREE' | 'PRO' | 'ENTERPRISE') {
  // Free users: Groq (cheapest, has free tier)
  if (userPlan === 'FREE') {
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: query }],
    });
    return res.choices[0].message.content;
  }
  
  // Pro users: Mistral Small
  if (userPlan === 'PRO') {
    const res = await mistral.chat({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: query }],
    });
    return res.choices[0].message.content;
  }
  
  // Enterprise: Best model
  // ... existing OpenAI code
}
```

**Install:** `bun add groq-sdk @mistralai/mistralai`

---

### 3. Add Rate Limiting (Priority: HIGH)

**File:** `src/lib/rate-limit.ts`
```typescript
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
});

export const freeUserLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 d'), // 5 AI sessions per day
});
```

**Install:** `bun add @upstash/ratelimit`

**Usage in API route:**
```typescript
const { success } = await rateLimiter.limit(userId);
if (!success) {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

---

### 4. Add Job Queue for AI Requests (Priority: MEDIUM)

**File:** `src/lib/queue.ts`
```typescript
import Queue from 'bullmq';
import { redis } from './cache';

export const aiQueue = new Queue('ai-processing', {
  connection: redis,
});

// Add job
export async function queueAIRequest(userId: string, query: string) {
  await aiQueue.add('process', { userId, query });
}

// Worker (separate process)
import { Worker } from 'bullmq';

const worker = new Worker('ai-processing', async job => {
  const { userId, query } = job.data;
  // Process AI request
}, { connection: redis });
```

**Install:** `bun add bullmq`

---

### 5. Database Connection Pooling (Priority: MEDIUM)

**File:** `src/lib/db.ts`
```typescript
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const db = new PrismaClient({ adapter });
```

---

## 💰 **Cost Breakdown at 50K Users**

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Railway** | Pro ($20) + usage | ~$50 |
| **Neon DB** | Pro | $19 |
| **Upstash Redis** | Pro | $10 |
| **Clerk** | Pro | $25 |
| **Groq AI** | Free tier | $0 |
| **Mistral AI** | Pay per use | ~$200 |
| **Domain + SSL** | - | $1 |
| **Monitoring (Sentry)** | Team | $26 |
| **TOTAL** | | **~$331/month** |

---

## 📈 **Revenue at 50K Users (Conservative)**

| Plan | Users | Price | Monthly Revenue |
|------|-------|-------|-----------------|
| Free | 45,000 | $0 | $0 |
| Pro | 4,500 | $9.99 | $44,955 |
| Enterprise | 500 | $29.99 | $14,995 |
| **TOTAL** | | | **$59,950/month** |

**Profit:** ~$59,600/month (after ~$350 costs)

---

## 📱 **App Store Submission Checklist**

### When You're Ready for Mobile Apps

**iOS App Store:**
- [ ] Apple Developer Account ($99/year)
- [ ] Add Sign in with Apple (Clerk supports this)
- [ ] Add push notifications
- [ ] Privacy manifest file
- [ ] App Privacy Labels in App Store Connect
- [ ] Launch screen
- [ ] Screenshots for all device sizes

**Google Play Store:**
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Target API 34 (Android 14)
- [ ] Data Safety form completed
- [ ] Content Rating questionnaire
- [ ] Privacy Policy URL
- [ ] App Bundle (.aab) signed

**Required Capacitor Plugins:**
```bash
bun add @capacitor/push-notifications @capacitor/haptics @capacitor/share @capacitor/app @capacitor/device @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
```

---

## 🚀 **Quick Implementation Order**

When ready to scale:

1. **Week 1:**
   - Add Upstash Redis
   - Add rate limiting
   - Switch to Groq/Mistral

2. **Week 2:**
   - Add caching for AI responses
   - Optimize database queries
   - Add error monitoring (Sentry)

3. **Week 3:**
   - Load testing
   - Performance optimization
   - Mobile app preparation

---

## 🔧 **Environment Variables Needed**

```env
# Redis (Upstash)
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx

# AI - Cheaper Options
GROQ_API_KEY=gsk_xxx
MISTRAL_API_KEY=xxx

# Existing
DATABASE_URL=xxx
CLERK_SECRET_KEY=xxx
STRIPE_SECRET_KEY=xxx
```

---

## 📞 **Support Contacts**

| Service | Support |
|---------|---------|
| Railway | support@railway.app |
| Neon | support@neon.tech |
| Upstash | support@upstash.com |
| Clerk | support@clerk.com |

---

## ✅ **You're Currently Ready For**

- ✅ 100-1000 users (current setup)
- ✅ Client demos
- ✅ Beta testing
- ✅ First paying customers

## ⏳ **When to Scale**

Start implementing this guide when you hit:
- 500+ active users, OR
- 50+ paying customers, OR
- $500+ MRR

---

*Last updated: March 2025*
