import "dotenv/config";
import app from "../api/index.js";

const email = process.env.ADMIN_SMOKE_EMAIL;
const password = process.env.ADMIN_SMOKE_PASSWORD;

if (!email || !password) {
  console.error("ADMIN_SMOKE_EMAIL and ADMIN_SMOKE_PASSWORD are required.");
  process.exit(1);
}

const server = app.listen(4012);
const baseUrl = "http://127.0.0.1:4012/api";
const slug = `admin-smoke-${Date.now()}`;
let authToken = "";
let createdProductId = "";

const request = async (path, init = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`);
  }
  if (body?.error) {
    throw new Error(`${path} failed: ${JSON.stringify(body.error)}`);
  }
  return body?.data ?? body;
};

const cleanup = async () => {
  if (!createdProductId) return;
  try {
    await request("/db/products/query", {
      method: "POST",
      body: JSON.stringify({
        op: "delete",
        filters: [{ field: "id", operator: "eq", value: createdProductId }],
      }),
    });
  } catch (error) {
    console.error("Cleanup failed:", error instanceof Error ? error.message : String(error));
  }
};

try {
  const health = await request("/health");
  if (!health?.ok) throw new Error("Health check failed");

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  authToken = login?.access_token || "";
  if (!authToken || !login?.user?.id) throw new Error("Admin login failed");

  const categories = await request("/db/categories/query", {
    method: "POST",
    body: JSON.stringify({ op: "select", limit: 1 }),
  });
  const category = categories?.[0];
  if (!category?.id) throw new Error("No category available for smoke test");

  const createdProduct = await request("/db/products/query", {
    method: "POST",
    body: JSON.stringify({
      op: "insert",
      payload: {
        name: "Admin Smoke Product",
        slug,
        price: 149.99,
        original_price: 179.99,
        category_id: category.id,
        brand: "Merchant's Delight",
        description: "Temporary product for admin smoke test.",
        long_description: "Temporary product for admin smoke test.",
        is_featured: false,
        is_new: true,
        is_trending: false,
      },
      singleMode: "single",
    }),
  });

  createdProductId = createdProduct?.id || "";
  if (!createdProductId) throw new Error("Product creation did not return an id");

  await request("/db/product_images/query", {
    method: "POST",
    body: JSON.stringify({
      op: "insert",
      payload: {
        product_id: createdProductId,
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
        position: 0,
      },
      singleMode: "single",
    }),
  });

  await request("/db/product_variants/query", {
    method: "POST",
    body: JSON.stringify({
      op: "insert",
      payload: {
        product_id: createdProductId,
        size: "10",
        color: "Black",
        color_hex: "#111111",
        stock: 12,
        price: 149.99,
      },
      singleMode: "single",
    }),
  });

  const insertedProduct = await request("/db/products/query", {
    method: "POST",
    body: JSON.stringify({
      op: "select",
      filters: [{ field: "id", operator: "eq", value: createdProductId }],
      singleMode: "single",
    }),
  });

  if (insertedProduct?.name !== "Admin Smoke Product") throw new Error("Inserted product name mismatch");

  await request("/db/products/query", {
    method: "POST",
    body: JSON.stringify({
      op: "update",
      filters: [{ field: "id", operator: "eq", value: createdProductId }],
      payload: {
        name: "Admin Smoke Product Updated",
        price: 159.99,
        is_trending: true,
      },
      singleMode: "single",
    }),
  });

  const updatedProduct = await request("/db/products/query", {
    method: "POST",
    body: JSON.stringify({
      op: "select",
      filters: [{ field: "id", operator: "eq", value: createdProductId }],
      singleMode: "single",
    }),
  });

  if (updatedProduct?.name !== "Admin Smoke Product Updated") throw new Error("Updated product name mismatch");
  if (Number(updatedProduct?.price) !== 159.99) throw new Error("Updated product price mismatch");
  if (updatedProduct?.is_trending !== true) throw new Error("Updated product trending flag mismatch");

  console.log(JSON.stringify({
    ok: true,
    admin: login.user.email,
    createdProductId,
    slug,
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await cleanup();
  await new Promise((resolve) => server.close(resolve));
  process.exit(process.exitCode || 0);
}
