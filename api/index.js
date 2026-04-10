import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { buildProductSeed, buildShippingSeed, defaultCategories } from "./seed-data.js";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.MONGODB_DB_NAME || "merchants_delight";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const DEFAULT_SITE_URL = process.env.DEFAULT_SITE_URL || "http://localhost:8080";

if (!MONGODB_URI) throw new Error("MONGODB_URI is required");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

let db = null;
let mongoClient = null;

const connectDB = async () => {
  if (db) return db;
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
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
  const messages = req.body?.messages || [];
  try {
    const products = await req.db.collection("products").find({}).toArray();
    const categories = await req.db.collection("categories").find({}).toArray();

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are the Lead Concierge for Merchant's Delight, a premier high-end footwear destination. 
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
4. Maintain the aura of a luxury boutique.`,
      messages: (messages || []).map(m => ({ role: m.role, content: m.content })),
    });

    return res.json({ reply: text });
  } catch (error) {
    console.error("AI Concierge Error:", error);
    return res.json({ reply: "I apologize, but I am momentarily unable to assist. Please try again or contact our boutique directly." });
  }
});

app.post("/api/functions/return-assistant", async (req, res) => {
  const { action, payload, messages } = req.body || {};

  if (action === "lookup_order") {
    const orderNumber = String(payload?.order_number || "").toUpperCase();
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
  }

  if (action === "check_return_status") {
    const returnId = String(payload?.return_request_id || "").toUpperCase();
    const query = payload?.user_id ? { return_request_id: returnId, user_id: payload.user_id } : { return_request_id: returnId };
    return res.json({ returns: await req.db.collection("return_requests").find(query).toArray() });
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are the Senior Return Specialist at Merchant's Delight. 
You handle return inquiries with empathy, precision, and a focus on high-touch service.
Our policy is strictly 14 days from delivery for original-condition items.

GUIDELINES:
1. When a user provides an order number, wait for the system to inject context or acknowledge you are checking.
2. If the user mentions return policy, explain our 14-day window for delivered items.
3. If an order is ineligible, be firm yet graceful and offer manual support options.
4. Use markdown for a clean, professional presentation.`,
      messages: (messages || []).map(m => ({ role: m.role, content: m.content })),
    });

    return res.json({ reply: text });
  } catch (error) {
    console.error("Return AI Error:", error);
    return res.json({ reply: "I am having difficulty accessing our return records. Please try again shortly." });
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
