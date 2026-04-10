import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { buildProductSeed, buildShippingSeed, defaultCategories } from "./seed-data.js";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DIRECT_URI = process.env.MONGODB_DIRECT_URI || "";
const DB_NAME = process.env.MONGODB_DB_NAME || "merchants_delight";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const DEFAULT_SITE_URL = process.env.DEFAULT_SITE_URL || "http://localhost:8080";
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const AI_PROVIDER = (process.env.AI_PROVIDER || "auto").trim().toLowerCase();

if (!MONGODB_URI && !MONGODB_DIRECT_URI) throw new Error("MONGODB_URI or MONGODB_DIRECT_URI is required");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

let db = null;
let mongoClient = null;

const connectDB = async () => {
  if (db) return db;
  if (!mongoClient) {
    const urisToTry = [MONGODB_DIRECT_URI, MONGODB_URI].filter(Boolean);
    let lastError = null;

    for (const uri of urisToTry) {
      try {
        mongoClient = new MongoClient(uri);
        await mongoClient.connect();
        break;
      } catch (error) {
        lastError = error;
        mongoClient = null;
      }
    }

    if (!mongoClient) {
      throw lastError || new Error("MongoDB connection failed");
    }
  }
  db = mongoClient.db(DB_NAME);
  return db;
};

// Middleware to ensure DB connection
app.use(async (req, _res, next) => {
  req.db = await connectDB();
  req.user = await getUserFromToken(authTokenFromReq(req), req.db);
  next();
});

const collectionMap = {
  profiles: "profiles",
  user_roles: "user_roles",
  categories: "categories",
  products: "products",
  product_images: "product_images",
  product_variants: "product_variants",
  reviews: "reviews",
  product_reviews: "product_reviews",
  orders: "orders",
  shipping_methods: "shipping_methods",
  return_requests: "return_requests",
  ai_debug_logs: "ai_debug_logs",
  notifications: "notifications",
  admin_notifications: "admin_notifications",
  newsletter_subscribers: "newsletter_subscribers",
  contact_messages: "contact_messages",
  discount_codes: "discount_codes",
  gift_cards: "gift_cards",
};

const nowIso = () => new Date().toISOString();
const getCollection = (req, table) => req.db.collection(collectionMap[table]);
const authTokenFromReq = (req) => (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
const toMongoQuery = (filters = []) => {
  const query = {};
  for (const filter of filters) {
    if (!filter?.field) continue;
    if (filter.operator === "eq") query[filter.field] = filter.value;
    if (filter.operator === "neq") query[filter.field] = { $ne: filter.value };
    if (filter.operator === "in") query[filter.field] = { $in: filter.value || [] };
  }
  return query;
};
const sortFromOrder = (order) => (!order?.field ? { created_at: -1 } : { [order.field]: order.ascending === false ? -1 : 1 });
const serializeError = (error, code) => ({ message: error instanceof Error ? error.message : String(error), code });
const normalizeDoc = (doc, defaults = {}) => ({ id: doc.id || randomUUID(), ...defaults, ...doc });
const duplicateKeyCode = (error) => (error && typeof error === "object" && "code" in error && error.code === 11000 ? "23505" : undefined);

const hasRole = async (db, userId, role) => {
  if (!userId) return false;
  return (await db.collection("user_roles").countDocuments({ user_id: userId, role })) > 0;
};

const getUserFromToken = async (token, db) => {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await db.collection("users").findOne({ id: payload.sub }, { projection: { password_hash: 0 } });
    if (!user) return null;
    const roles = await db.collection("user_roles").find({ user_id: user.id }).toArray();
    return { ...user, roles: roles.map((entry) => entry.role) };
  } catch {
    return null;
  }
};

const createSession = (user) => {
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  return {
    access_token: token,
    token_type: "bearer",
    user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name || null } },
  };
};

const createNotification = async (db, title, message, link = "/admin/orders") => {
  await db.collection("admin_notifications").insertOne({
    id: randomUUID(),
    title,
    message,
    link,
    is_read: false,
    created_at: nowIso(),
  });
};

const createAiDebugLog = async (db, entry = {}) => {
  const doc = {
    id: randomUUID(),
    source: entry.source || "unknown",
    status: entry.status || "info",
    provider: entry.provider || getDefaultProviderForLogs(),
    model: entry.model || getDefaultModelForLogs(),
    configured: entry.configured ?? Boolean(getConfiguredAiProviders().length),
    duration_ms: entry.duration_ms ?? null,
    message: entry.message || "",
    error: entry.error || null,
    request_excerpt: entry.request_excerpt || "",
    meta: entry.meta || {},
    created_at: nowIso(),
  };

  try {
    await db.collection("ai_debug_logs").insertOne(doc);
  } catch (error) {
    console.error("AI debug log insert failed:", error);
  }

  return doc;
};

const notifyAiFailure = async (db, source, errorMessage) => {
  try {
    await createNotification(
      db,
      `${source} degraded`,
      `${source} fell back after an AI provider error: ${errorMessage}`.slice(0, 220),
      "/admin/settings"
    );
  } catch (error) {
    console.error("AI admin notification failed:", error);
  }
};

const normalizeAiMessages = (messages = []) =>
  (Array.isArray(messages) ? messages : [])
    .filter((message) => message && typeof message.content === "string" && typeof message.role === "string")
    .map((message) => ({ role: message.role, content: message.content.trim() }))
    .filter((message) => message.content);

const getConfiguredAiProviders = () => {
  const providers = [];
  if (GEMINI_API_KEY) providers.push("gemini");
  if (OPENAI_API_KEY) providers.push("openai");
  if (OLLAMA_BASE_URL) providers.push("ollama");
  return providers;
};

const getPreferredAiProviders = () => {
  const configuredProviders = getConfiguredAiProviders();
  if (!configuredProviders.length) return [];

  if (AI_PROVIDER === "gemini") {
    return ["gemini", "openai", "ollama"].filter((provider) => configuredProviders.includes(provider));
  }

  if (AI_PROVIDER === "openai") {
    return ["openai", "gemini", "ollama"].filter((provider) => configuredProviders.includes(provider));
  }

  if (AI_PROVIDER === "ollama") {
    return ["ollama", "gemini", "openai"].filter((provider) => configuredProviders.includes(provider));
  }

  if (configuredProviders.includes("gemini")) {
    return ["gemini", "openai", "ollama"].filter((provider) => configuredProviders.includes(provider));
  }

  if (configuredProviders.includes("openai")) {
    return ["openai", "gemini", "ollama"].filter((provider) => configuredProviders.includes(provider));
  }

  return configuredProviders;
};

const getDefaultProviderForLogs = () => getPreferredAiProviders()[0] || "none";
const getDefaultModelForLogs = () => {
  const provider = getDefaultProviderForLogs();
  if (provider === "ollama") return OLLAMA_MODEL;
  if (provider === "openai") return OPENAI_MODEL;
  if (provider === "gemini") return GEMINI_MODEL;
  return null;
};

const latestUserMessage = (messages = []) =>
  [...messages].reverse().find((message) => message.role === "user" && typeof message.content === "string")?.content || "";

const keywordScore = (text, keywords = []) => {
  const haystack = String(text || "").toLowerCase();
  return keywords.reduce((score, keyword) => (haystack.includes(String(keyword || "").toLowerCase()) ? score + 1 : score), 0);
};

const buildMainAssistantFallback = ({ messages, products, categories }) => {
  const prompt = latestUserMessage(messages);
  const normalizedPrompt = prompt.toLowerCase();

  if (!products.length) {
    return "I can help with product discovery, sizing, and styling, but our catalog is not available right now. Please try again shortly.";
  }

  const scoredProducts = products
    .map((product) => ({
      product,
      score: keywordScore(normalizedPrompt, [
        product.name,
        product.category,
        product.slug,
        product.description,
        ...(Array.isArray(product.tags) ? product.tags : []),
      ]),
    }))
    .sort((a, b) => b.score - a.score || Number(a.product.price || 0) - Number(b.product.price || 0));

  const matches = scoredProducts.filter((entry) => entry.score > 0).slice(0, 3).map((entry) => entry.product);
  const showcase = (matches.length ? matches : products.slice(0, 3)).map((product) =>
    `- **${product.name}** ($${product.price}): ${product.description || "Premium footwear from our current collection."}`
  );

  if (/(trend|popular|best|recommend|suggest)/i.test(prompt)) {
    return `Here are strong options from our current collection:\n${showcase.join("\n")}\n\nTell me your preferred use case, size, budget, or style direction and I will narrow this down further.`;
  }

  if (/(under|budget|\$|price|afford)/i.test(prompt)) {
    const budget = Number((prompt.match(/\$?\s*(\d{2,4})/) || [])[1]);
    const withinBudget = Number.isFinite(budget)
      ? products.filter((product) => Number(product.price || 0) <= budget).slice(0, 3)
      : [];
    if (withinBudget.length) {
      return `Here are options within your stated budget:\n${withinBudget
        .map((product) => `- **${product.name}** ($${product.price}): ${product.description || "Premium footwear option."}`)
        .join("\n")}`;
    }
  }

  if (/(category|categories|types|collection)/i.test(prompt) && categories.length) {
    return `Our current categories include:\n${categories
      .map((category) => `- **${category.name}**: ${category.description || "Available now."}`)
      .join("\n")}`;
  }

  return `I can help you shop our collection. Based on your message, these are the best starting points:\n${showcase.join(
    "\n"
  )}\n\nIf you tell me whether you want something for running, everyday wear, dress styling, or a price range, I can make this much more precise.`;
};

const buildReturnAssistantFallback = ({ messages }) => {
  const prompt = latestUserMessage(messages);

  if (/(policy|window|days|eligible|eligibility)/i.test(prompt)) {
    return "Our return policy is **14 days from delivery** for items returned in original condition. If you share your **order number**, I can help check whether the order is still within the return window.";
  }

  if (/(status|track|ret-)/i.test(prompt)) {
    return "Please share your **return request ID** in the format `RET-XXXX`, and I will help check the current status.";
  }

  if (/(return|exchange|refund)/i.test(prompt)) {
    return "To start a return or exchange, send your **order number** in the format `ORD-XXXX` and, if needed, the email used for the order. I can then help verify eligibility and guide the next step.";
  }

  return "I can help with returns, exchanges, and return status checks. Send your **order number** to verify eligibility, or send your **return request ID** to track an existing return.";
};

const tryOpenAiText = async ({ system, messages }) => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI request failed with status ${response.status}`);
  }

  const text = typeof data?.choices?.[0]?.message?.content === "string" ? data.choices[0].message.content.trim() : "";

  return text;
};

const tryGeminiText = async ({ system, messages }) => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = [
    system ? `System instructions:\n${system}` : "",
    ...messages.map((message) => `${message.role.toUpperCase()}:\n${message.content}`),
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini request failed with status ${response.status}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("\n").trim();

  return text;
};

const tryProviderText = async (provider, payload) => {
  if (provider === "gemini") return tryGeminiText(payload);
  if (provider === "openai") return tryOpenAiText(payload);
  if (provider === "ollama") return tryOllamaText(payload);
  throw new Error(`Unsupported AI provider: ${provider}`);
};

const modelForProvider = (provider) => {
  if (provider === "gemini") return GEMINI_MODEL;
  if (provider === "ollama") return OLLAMA_MODEL;
  return OPENAI_MODEL;
};

const tryOllamaText = async ({ system, messages }) => {
  if (!OLLAMA_BASE_URL) {
    throw new Error("OLLAMA_BASE_URL is not configured");
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Ollama request failed with status ${response.status}`);
  }

  return data?.message?.content?.trim();
};

const generateResilientAssistantReply = async ({ db, source, system, messages, fallbackBuilder, logLabel }) => {
  const startedAt = Date.now();
  const requestExcerpt = latestUserMessage(messages).slice(0, 240);
  const providersToTry = getPreferredAiProviders();

  if (!providersToTry.length) {
    const errorMessage = "No AI provider is configured. Set OPENAI_API_KEY or OLLAMA_BASE_URL.";
    await createAiDebugLog(db, {
      source,
      status: "fallback",
      provider: "none",
      model: null,
      configured: false,
      duration_ms: Date.now() - startedAt,
      message: "Fallback response served because no AI provider is configured.",
      error: errorMessage,
      request_excerpt: requestExcerpt,
      meta: { message_count: messages.length, configured_providers: [] },
    });
    await notifyAiFailure(db, source, errorMessage);
    return fallbackBuilder();
  }

  try {
    let provider = providersToTry[0];
    let reply = "";
    const errors = [];

    for (const candidate of providersToTry) {
      try {
        provider = candidate;
        reply = await tryProviderText(candidate, { system, messages });
        if (reply) break;
      } catch (error) {
        errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (!reply) {
      throw new Error(errors.join(" | ") || "AI provider returned an empty response");
    }

    await createAiDebugLog(db, {
      source,
      status: "success",
      provider,
      model: modelForProvider(provider),
      configured: true,
      duration_ms: Date.now() - startedAt,
      message: `${provider} response generated successfully.`,
      request_excerpt: requestExcerpt,
      meta: { message_count: messages.length, providers_tried: providersToTry },
    });

    return reply;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${logLabel} fallback engaged`, errorMessage);
    await createAiDebugLog(db, {
      source,
      status: "fallback",
      provider: getDefaultProviderForLogs(),
      model: getDefaultModelForLogs(),
      configured: Boolean(providersToTry.length),
      duration_ms: Date.now() - startedAt,
      message: "Fallback response served after AI provider failure.",
      error: errorMessage,
      request_excerpt: requestExcerpt,
      meta: { message_count: messages.length, providers_tried: providersToTry },
    });
    await notifyAiFailure(db, source, errorMessage);
    return fallbackBuilder();
  }
};

const withJoins = async (db, table, rows, selectSpec) => {
  if (!rows?.length) return rows;

  if (table === "profiles" && selectSpec?.includes("user_roles")) {
    const userIds = rows.map((row) => row.user_id);
    const roles = await db.collection("user_roles").find({ user_id: { $in: userIds } }).toArray();
    const rolesByUser = new Map();
    for (const role of roles) {
      const bucket = rolesByUser.get(role.user_id) || [];
      bucket.push({ role: role.role });
      rolesByUser.set(role.user_id, bucket);
    }
    return rows.map((row) => ({ ...row, user_roles: rolesByUser.get(row.user_id) || [] }));
  }

  if (table === "orders" && selectSpec?.includes("profiles(")) {
    const userIds = rows.map((row) => row.user_id).filter(Boolean);
    const profiles = await db.collection("profiles").find({ user_id: { $in: userIds } }).toArray();
    const profilesByUser = new Map(profiles.map((profile) => [profile.user_id, profile]));
    return rows.map((row) => ({
      ...row,
      profiles: profilesByUser.get(row.user_id)
        ? { full_name: profilesByUser.get(row.user_id).full_name || null, email: profilesByUser.get(row.user_id).email || null }
        : null,
    }));
  }

  if ((table === "reviews" || table === "product_reviews") && selectSpec?.includes("profiles")) {
    const userIds = rows.map((row) => row.user_id).filter(Boolean);
    const profiles = await db.collection("profiles").find({ user_id: { $in: userIds } }).toArray();
    const profilesByUser = new Map(profiles.map((profile) => [profile.user_id, profile]));
    return rows.map((row) => ({
      ...row,
      profiles: profilesByUser.get(row.user_id)
        ? { full_name: profilesByUser.get(row.user_id).full_name || null, avatar_url: profilesByUser.get(row.user_id).avatar_url || null }
        : null,
    }));
  }

  return rows;
};

const ensureAuthorized = async (req, table, op, filters) => {
  const user = req.user;
  const isAdmin = user ? await hasRole(req.db, user.id, "admin") : false;
  const filterMap = new Map((filters || []).map((filter) => [filter.field, filter]));
  const ownUserId = filterMap.get("user_id")?.value;

  if (op === "select" && new Set(["products", "product_images", "product_variants", "categories", "shipping_methods", "reviews", "product_reviews"]).has(table)) return;
  if (table === "newsletter_subscribers" && op === "insert") return;
  if (table === "contact_messages" && op === "insert") return;
  if ((table === "discount_codes" || table === "gift_cards") && op === "select") return;
  if (table === "orders" && op === "select" && !user && filterMap.has("order_number")) return;
  if (!user) throw new Error("Authentication required");
  if (isAdmin) return;
  if (table === "profiles" && ["select", "update"].includes(op) && ownUserId === user.id) return;
  if (table === "orders" && op === "select" && ownUserId === user.id) return;
  if (table === "return_requests" && op === "select" && ownUserId === user.id) return;
  if (table === "notifications" && ["select", "update"].includes(op) && ownUserId === user.id) return;
  if ((table === "reviews" || table === "product_reviews") && op === "insert") return;
  throw new Error("Forbidden");
};

app.get("/api/health", async (req, res) => {
  res.json({
    ok: true,
    categories: await req.db.collection("categories").countDocuments(),
    products: await req.db.collection("products").countDocuments(),
  });
});

app.post("/api/functions/ai-debug-status", async (req, res) => {
  const isAdmin = req.user ? await hasRole(req.db, req.user.id, "admin") : false;
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const recentLogs = await req.db.collection("ai_debug_logs").find({}).sort({ created_at: -1 }).limit(10).toArray();
  const latestSuccess = await req.db.collection("ai_debug_logs").findOne({ status: "success" }, { sort: { created_at: -1 } });
  const latestFallback = await req.db.collection("ai_debug_logs").findOne({ status: "fallback" }, { sort: { created_at: -1 } });

  return res.json({
    configured: Boolean(getConfiguredAiProviders().length),
    provider: getDefaultProviderForLogs(),
    model: getDefaultModelForLogs(),
    providers: getConfiguredAiProviders(),
    latest_success_at: latestSuccess?.created_at || null,
    latest_fallback_at: latestFallback?.created_at || null,
    recent_logs: recentLogs,
  });
});

app.post("/api/functions/ai-debug-test", async (req, res) => {
  const isAdmin = req.user ? await hasRole(req.db, req.user.id, "admin") : false;
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const startedAt = Date.now();
  try {
    const providersToTry = getPreferredAiProviders();
    if (!providersToTry.length) {
      throw new Error("No AI provider is configured. Set OPENAI_API_KEY or OLLAMA_BASE_URL.");
    }

    let provider = providersToTry[0];
    let text = "";
    const errors = [];

    for (const candidate of providersToTry) {
      try {
        provider = candidate;
        text = await tryProviderText(candidate, {
          system:
            candidate === "ollama"
              ? "You are a connectivity test. Reply with exactly: OLLAMA_OK"
              : candidate === "gemini"
                ? "You are a connectivity test. Reply with exactly: GEMINI_OK"
                : "You are a connectivity test. Reply with exactly: OPENAI_OK",
          messages: [{ role: "user", content: "Ping" }],
        });
        if (text) break;
      } catch (error) {
        errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (!text) {
      throw new Error(errors.join(" | ") || "AI connectivity test returned an empty response");
    }

    const model = modelForProvider(provider);

    await createAiDebugLog(req.db, {
      source: "admin-ai-test",
      status: "success",
      provider,
      model,
      configured: true,
      duration_ms: Date.now() - startedAt,
      message: `Admin ${provider} connectivity test passed.`,
      request_excerpt: "Ping",
      meta: { reply: text, providers_tried: providersToTry },
    });

    const expectedReply = provider === "ollama" ? "OLLAMA_OK" : provider === "gemini" ? "GEMINI_OK" : "OPENAI_OK";
    return res.json({ ok: text === expectedReply, reply: text, model, provider });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await createAiDebugLog(req.db, {
      source: "admin-ai-test",
      status: "error",
      provider: getDefaultProviderForLogs(),
      model: getDefaultModelForLogs(),
      configured: Boolean(getConfiguredAiProviders().length),
      duration_ms: Date.now() - startedAt,
      message: "Admin AI connectivity test failed.",
      error: errorMessage,
      request_excerpt: "Ping",
    });
    await notifyAiFailure(req.db, "admin-ai-test", errorMessage);
    return res.status(500).json({ ok: false, error: errorMessage, model: getDefaultModelForLogs(), provider: getDefaultProviderForLogs() });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const fullName = String(req.body?.full_name || "");
    if (!email || !password) throw new Error("Email and password are required");

    if (await req.db.collection("users").findOne({ email })) {
      return res.json({ data: null, error: { message: "An account with this email already exists" } });
    }

    const adminCount = await req.db.collection("user_roles").countDocuments({ role: "admin" });
    const userId = randomUUID();
    const createdAt = nowIso();

    await req.db.collection("users").insertOne({
      id: userId,
      email,
      password_hash: await bcrypt.hash(password, 10),
      full_name: fullName || null,
      created_at: createdAt,
      updated_at: createdAt,
    });

    await req.db.collection("profiles").insertOne({
      id: randomUUID(),
      user_id: userId,
      email,
      full_name: fullName || null,
      phone: null,
      avatar_url: null,
      address_line1: null,
      address_line2: null,
      city: null,
      state: null,
      zip_code: null,
      country: "US",
      reward_points: 0,
      is_admin: adminCount === 0,
      created_at: createdAt,
      updated_at: createdAt,
    });

    await req.db.collection("user_roles").insertOne({ id: randomUUID(), user_id: userId, role: adminCount === 0 ? "admin" : "user", created_at: createdAt });
    if (adminCount === 0) {
      await req.db.collection("user_roles").insertOne({ id: randomUUID(), user_id: userId, role: "user", created_at: createdAt });
    }

    return res.json({ data: createSession({ id: userId, email, full_name: fullName }), error: null });
  } catch (error) {
    return res.json({ data: null, error: serializeError(error) });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = await req.db.collection("users").findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.json({ data: null, error: { message: "Invalid credentials" } });
    }
    return res.json({ data: createSession(user), error: null });
  } catch (error) {
    return res.json({ data: null, error: serializeError(error) });
  }
});

app.get("/api/auth/me", async (req, res) => {
  return res.json({ data: { session: req.user ? createSession(req.user) : null }, error: null });
});

app.post("/api/rpc/has_role", async (req, res) => {
  try {
    return res.json({ data: await hasRole(req.db, req.body?._user_id, req.body?._role), error: null });
  } catch (error) {
    return res.json({ data: null, error: serializeError(error) });
  }
});

app.post("/api/db/:table/query", async (req, res) => {
  const { table } = req.params;
  const { op = "select", selectSpec = "*", filters = [], order = null, limit = null, payload = null, options = {}, singleMode = null } = req.body || {};

  try {
    if (!collectionMap[table]) throw new Error(`Unknown table: ${table}`);
    await ensureAuthorized(req, table, op, filters);
    const collection = getCollection(req, table);
    const query = toMongoQuery(filters);

    if (op === "select") {
      let cursor = collection.find(query).sort(sortFromOrder(order));
      if (typeof limit === "number") cursor = cursor.limit(limit);
      const rows = await withJoins(req.db, table, await cursor.toArray(), selectSpec);
      if (singleMode === "single") {
        return res.json({ data: rows[0] || null, error: rows[0] ? null : { message: "Row not found", code: "PGRST116" } });
      }
      if (singleMode === "maybeSingle") return res.json({ data: rows[0] || null, error: null });
      return res.json({ data: rows, error: null });
    }

    if (op === "insert") {
      const docs = (Array.isArray(payload) ? payload : [payload]).map((item) => normalizeDoc(item, { created_at: nowIso(), updated_at: nowIso() }));
      if ((table === "reviews" || table === "product_reviews") && req.user) {
        docs.forEach((doc) => {
          doc.user_id = req.user.id;
          doc.is_verified_purchase = Boolean(doc.is_verified_purchase);
        });
      }
      if (table === "shipping_methods") {
        docs.forEach((doc) => {
          doc.is_active = doc.is_active ?? true;
          doc.country_code = doc.country_code || (String(doc.carrier || "").toUpperCase().includes("DHL") ? "ALL" : "US");
        });
      }
      if (table === "newsletter_subscribers") {
        docs.forEach((doc) => {
          doc.email = String(doc.email || "").trim().toLowerCase();
        });
      }
      await collection.insertMany(docs, { ordered: true });
      if ((table === "reviews" || table === "product_reviews") && req.user) {
        const existingProfile = await req.db.collection("profiles").findOne({ user_id: req.user.id });
        if (existingProfile) {
          await req.db.collection("profiles").updateOne(
            { user_id: req.user.id },
            {
              $set: {
                reward_points: Number(existingProfile.reward_points || 0) + 50,
                updated_at: nowIso(),
              },
            }
          );
        }
      }
      if (table === "contact_messages") {
        await createNotification(req.db, "New contact message", `Message received from ${docs[0]?.email || "customer"}.`, "/admin/settings");
      }
      return res.json({ data: docs.length === 1 ? docs[0] : docs, error: null });
    }

    if (op === "update") {
      const beforeRows = table === "orders" ? await collection.find(query).toArray() : [];
      await collection.updateMany(query, { $set: { ...payload, updated_at: nowIso() } });
      const rows = await collection.find(query).toArray();
      if (table === "orders") {
        for (const beforeRow of beforeRows) {
          const afterRow = rows.find((row) => row.id === beforeRow.id);
          if (!afterRow) continue;
          if (beforeRow.status !== "delivered" && afterRow.status === "delivered" && afterRow.user_id) {
            await req.db.collection("profiles").updateOne(
              { user_id: afterRow.user_id },
              { $inc: { reward_points: Math.max(1, Math.floor(Number(afterRow.total || 0))) }, $set: { updated_at: nowIso() } }
            );
            await req.db.collection("notifications").insertOne({
              id: randomUUID(),
              user_id: afterRow.user_id,
              title: "Order delivered",
              message: `Order ${afterRow.order_number} has been delivered. Reward points have been added to your account.`,
              type: "order",
              link: "/orders",
              created_at: nowIso(),
            });
          }
        }
      }
      return res.json({ data: singleMode === "single" ? rows[0] || null : rows, error: null });
    }

    if (op === "delete") {
      const rows = await collection.find(query).toArray();
      await collection.deleteMany(query);
      if (table === "products") {
        const productIds = rows.map((row) => row.id);
        if (productIds.length) {
          await req.db.collection("product_images").deleteMany({ product_id: { $in: productIds } });
          await req.db.collection("product_variants").deleteMany({ product_id: { $in: productIds } });
        }
      }
      return res.json({ data: rows, error: null });
    }

    if (op === "upsert") {
      const docs = Array.isArray(payload) ? payload : [payload];
      const onConflict = options?.onConflict;
      const saved = [];

      for (const doc of docs) {
        const normalized = normalizeDoc(doc, { created_at: nowIso(), updated_at: nowIso() });
        if (!onConflict) {
          await collection.insertOne(normalized);
          saved.push(normalized);
          continue;
        }

        const existing = await collection.findOne({ [onConflict]: normalized[onConflict] });
        if (existing) {
          const merged = { ...existing, ...normalized, id: existing.id, updated_at: nowIso() };
          await collection.updateOne({ id: existing.id }, { $set: merged });
          saved.push(merged);
        } else {
          await collection.insertOne(normalized);
          saved.push(normalized);
        }
      }

      return res.json({ data: singleMode === "single" ? saved[0] || null : saved.length === 1 ? saved[0] : saved, error: null });
    }

    return res.json({ data: null, error: { message: `Unsupported op: ${op}` } });
  } catch (error) {
    return res.json({ data: null, error: serializeError(error, duplicateKeyCode(error)) });
  }
});

app.post("/api/functions/ai-assistant", async (req, res) => {
  const messages = normalizeAiMessages(req.body?.messages || []);
  try {
    let products = [];
    let categories = [];
    try {
      [products, categories] = await Promise.all([
        req.db.collection("products").find({}).toArray(),
        req.db.collection("categories").find({}).toArray(),
      ]);
    } catch (catalogError) {
      console.error("AI Concierge catalog lookup failed:", catalogError);
    }

    const system = `You are the Lead Concierge for Merchant's Delight, a premier high-end footwear destination. 
Your tone is sophisticated, knowledgeable, and proactive. You provide expert styling advice, technical performance insights, and impeccable service.
Use markdown for formatting. Always prioritize our collection.

OUR CURRENT COLLECTION:
${products.map(p => `- ${p.name} ($${p.price}): ${p.description} (${p.category})`).join("\n")}

OUR CATEGORIES:
${categories.map(c => `- ${c.name}: ${c.description}`).join("\n")}

GUIDELINES:
1. Provide specific, tailored recommendations based on the user's needs.
2. Discuss footwear with technical authority (e.g., cushioning tech, leather quality, traction).
3. If a request is outside our catalog, suggest the most prestigious alternative we carry.
4. Maintain the aura of a luxury boutique.`;

    const reply = await generateResilientAssistantReply({
      db: req.db,
      source: "shopping-assistant",
      system,
      messages,
      logLabel: "AI Concierge Error",
      fallbackBuilder: () => buildMainAssistantFallback({ messages, products, categories }),
    });

    return res.json({ reply });
  } catch (error) {
    console.error("AI Concierge Error:", error);
    return res.json({ reply: "I can help you shop our collection, but I could not load the latest concierge response just now. Please try your request again." });
  }
});

app.post("/api/functions/return-assistant", async (req, res) => {
  const { action, payload, messages } = req.body || {};

  if (action === "lookup_order") {
    try {
      const orderNumber = String(payload?.order_number || "").toUpperCase();
      if (!orderNumber) {
        return res.json({ found: false, message: "Please provide a valid order number." });
      }

      const order = await req.db.collection("orders").findOne({ order_number: orderNumber });
      if (!order) return res.json({ found: false, message: "Our records do not indicate an order with that number." });

      const orderEmail = order.shipping_address?.email || order.email || null;
      if (!payload?.user_id && payload?.email && orderEmail && payload.email.toLowerCase() !== String(orderEmail).toLowerCase()) {
        return res.json({ found: true, needs_verification: true, message: "The email provided does not match our records for this order." });
      }

      const deliveredAt = order.delivered_at ? new Date(order.delivered_at) : null;
      const daysSinceDelivery = deliveredAt ? Math.floor((Date.now() - deliveredAt.getTime()) / 86400000) : null;
      const eligible = order.status === "delivered" && daysSinceDelivery !== null && daysSinceDelivery <= 14;
      return res.json({ 
        found: true, 
        order, 
        eligible, 
        days_remaining: eligible ? 14 - daysSinceDelivery : 0, 
        reason: eligible ? "This order is currently eligible for a professional return or exchange." : "This order has exceeded our 14-day premium return window." 
      });
    } catch (error) {
      console.error("Return order lookup failed:", error);
      return res.json({ found: false, message: "I could not verify that order just now. Please try again shortly." });
    }
  }

  if (action === "check_return_status") {
    try {
      const returnId = String(payload?.return_request_id || "").toUpperCase();
      if (!returnId) {
        return res.json({ returns: [], message: "Please provide a valid return request ID." });
      }
      const query = payload?.user_id ? { return_request_id: returnId, user_id: payload.user_id } : { return_request_id: returnId };
      return res.json({ returns: await req.db.collection("return_requests").find(query).toArray() });
    } catch (error) {
      console.error("Return status lookup failed:", error);
      return res.json({ returns: [], message: "I could not access return status records just now. Please try again shortly." });
    }
  }

  try {
    const normalizedMessages = normalizeAiMessages(messages || []);
    const system = `You are the Senior Return Specialist at Merchant's Delight. 
You handle return inquiries with empathy, precision, and a focus on high-touch service.
Our policy is strictly 14 days from delivery for original-condition items.

GUIDELINES:
1. When a user provides an order number, wait for the system to inject context or acknowledge you are checking.
2. If the user mentions return policy, explain our 14-day window for delivered items.
3. If an order is ineligible, be firm yet graceful and offer manual support options.
4. Use markdown for a clean, professional presentation.`;

    const reply = await generateResilientAssistantReply({
      db: req.db,
      source: "return-assistant",
      system,
      messages: normalizedMessages,
      logLabel: "Return AI Error",
      fallbackBuilder: () => buildReturnAssistantFallback({ messages: normalizedMessages }),
    });

    return res.json({ reply });
  } catch (error) {
    console.error("Return AI Error:", error);
    return res.json({ reply: "I can still help with return guidance, but I could not load the latest return assistant response just now. Please try again." });
  }
});

app.post("/api/functions/return-notification", async (req, res) => {
  try {
    const { return_request_id, order_number, user_id, new_status, resolution } = req.body || {};
    if (user_id) {
      await req.db.collection("notifications").insertOne({
        id: randomUUID(),
        user_id,
        title: "Return Status Updated",
        message: `Your return request #${return_request_id} for order #${order_number} is now ${new_status}.`,
        type: "return",
        link: "/account/returns",
        created_at: nowIso(),
      });
    }

    await createNotification(req.db,
      "Return status changed",
      `Return ${return_request_id} for order ${order_number} changed to ${new_status}${resolution ? ` (${resolution})` : ""}.`,
      "/admin/returns"
    );

    return res.json({ success: true, email_sent: false, message: "Database notifications created." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : "Notification failed" });
  }
});

const createCheckoutHandler = async (req, res) => {
  try {
    const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" }) : null;
    if (!stripe) throw new Error("Server misconfiguration: STRIPE_SECRET_KEY is not set");
    const user = req.user;
    const { items, shippingCost = 0, tax = 0, shippingAddress = {}, shippingMethod = "" } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) throw new Error("No items in cart");

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const lineItems = items.map((item, index) => {
      const productName = item.product_name || item.name || item.title || `Item ${index + 1}`;
      const size = item.variant_size || item.size || "Standard";
      const color = item.variant_color || item.color || "Default";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            description: `Size: ${size} | Color: ${color}`,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity || 1),
      };
    });

    if (shippingCost > 0) {
      lineItems.push({
        price_data: { currency: "usd", product_data: { name: `Shipping - ${shippingMethod || "Standard"}` }, unit_amount: Math.round(Number(shippingCost) * 100) },
        quantity: 1,
      });
    }

    if (tax > 0) {
      lineItems.push({
        price_data: { currency: "usd", product_data: { name: "Tax" }, unit_amount: Math.round(Number(tax) * 100) },
        quantity: 1,
      });
    }

    const origin = req.headers.origin || DEFAULT_SITE_URL;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email || shippingAddress.email || undefined,
      line_items: lineItems,
      success_url: `${origin}/checkout?success=true&order=${orderNumber}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: { order_number: orderNumber, user_id: user?.id || "guest", shipping_method: shippingMethod },
    });

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0);
    const createdAt = nowIso();
    await req.db.collection("orders").insertOne({
      id: randomUUID(),
      user_id: user?.id || null,
      order_number: orderNumber,
      status: "pending",
      items,
      subtotal,
      shipping: Number(shippingCost),
      tax: Number(tax),
      total: subtotal + Number(shippingCost) + Number(tax),
      shipping_address: shippingAddress,
      payment_method: "stripe",
      tracking_number: null,
      created_at: createdAt,
      updated_at: createdAt,
    });

    await createNotification(req.db, "New order placed", `Order ${orderNumber} has been created.`, "/admin/orders");
    return res.json({ url: session.url, orderNumber });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Checkout failed" });
  }
};

app.post("/api/functions/create-checkout", createCheckoutHandler);
app.post("/api/functions/create-checkout-session", createCheckoutHandler);

const ensureIndexes = async (db) => {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("profiles").createIndex({ user_id: 1 }, { unique: true });
  await db.collection("user_roles").createIndex({ user_id: 1, role: 1 }, { unique: true });
  await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
  await db.collection("products").createIndex({ slug: 1 }, { unique: true });
  await db.collection("orders").createIndex({ order_number: 1 }, { unique: true });
  await db.collection("return_requests").createIndex({ return_request_id: 1 }, { unique: true, sparse: true });
  await db.collection("ai_debug_logs").createIndex({ created_at: -1 });
  await db.collection("newsletter_subscribers").createIndex({ email: 1 }, { unique: true });
  await db.collection("discount_codes").createIndex({ code: 1 }, { unique: true, sparse: true });
  await db.collection("gift_cards").createIndex({ code: 1 }, { unique: true, sparse: true });
};

const seedIfEmpty = async (db) => {
  if ((await db.collection("categories").countDocuments()) === 0) {
    await db.collection("categories").insertMany(defaultCategories.map((category) => ({ ...category, created_at: nowIso(), updated_at: nowIso() })));
  }

  if ((await db.collection("products").countDocuments()) === 0) {
    const { products, productImages, productVariants } = buildProductSeed();
    await db.collection("products").insertMany(products);
    await db.collection("product_images").insertMany(productImages);
    await db.collection("product_variants").insertMany(productVariants);
  }

  if ((await db.collection("shipping_methods").countDocuments()) === 0) {
    await db.collection("shipping_methods").insertMany(buildShippingSeed());
  }
};

// Initialization for Serverless environment
const init = async () => {
  const db = await connectDB();
  await ensureIndexes(db);
  await seedIfEmpty(db);
};

init().catch(console.error);

export default app;
