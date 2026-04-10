import { randomUUID } from "node:crypto";

export const defaultCategories = [
  { id: randomUUID(), name: "Running", slug: "running", description: "Professional performance footwear for elite athletes and daily runners.", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80" },
  { id: randomUUID(), name: "Casual", slug: "casual", description: "Timeless designs blending everyday comfort with modern aesthetics.", image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80" },
  { id: randomUUID(), name: "Hiking", slug: "hiking", description: "Rugged, all-terrain footwear engineered for the most demanding trails.", image_url: "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=1000&q=80" },
  { id: randomUUID(), name: "Training", slug: "training", description: "Stability and support for high-intensity gym and cross-fit sessions.", image_url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1000&q=80" },
  { id: randomUUID(), name: "Luxury", slug: "luxury", description: "Exquisite handcrafted leather footwear for the discerning gentleman.", image_url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1000&q=80" },
  { id: randomUUID(), name: "Office", slug: "office", description: "Refined formal footwear for professional excellence and classic style.", image_url: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1000&q=80" },
  { id: randomUUID(), name: "Lifestyle", slug: "lifestyle", description: "Street-inspired fashion sneakers for bold self-expression.", image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1000&q=80" },
];

const categoryIdBySlug = Object.fromEntries(defaultCategories.map((category) => [category.slug, category.id]));

const baseProducts = [
  {
    name: "Apex Velocity Elite",
    slug: "apex-velocity-elite",
    brand: "Merchant's Delight",
    description: "Our most advanced running shoe yet, featuring carbon-fiber propulsion technology.",
    long_description: "The Apex Velocity Elite is engineered for the podium. Featuring our proprietary AeroFoam™ midsole for 90% energy return and an embedded full-length carbon plate for explosive toe-offs. The ultra-breathable WarpKnit upper provides a second-skin fit that stays cool during the most intense marathons.",
    price: 249,
    original_price: 299,
    rating: 4.9,
    review_count: 128,
    is_new: true,
    is_featured: true,
    is_trending: true,
    category_slug: "running",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80",
    ],
    variants: [["8", "Titanium Black", "#111111", 12], ["9", "Racing Red", "#C51F2A", 15], ["10", "Pure White", "#F5F5F5", 10], ["11", "Titanium Black", "#111111", 8]],
  },
  {
    name: "Urban Heritage Low",
    slug: "urban-heritage-low",
    brand: "Merchant's Delight",
    description: "Premium full-grain leather sneaker handcrafted for ultimate daily comfort.",
    long_description: "The Urban Heritage Low redefines the classic sneaker. Hand-stitched from premium Italian calfskin leather that develops a unique patina over time. The anatomical footbed and reinforced heel cup ensure all-day support, whether you're in the office or on the street.",
    price: 169,
    original_price: 199,
    rating: 4.7,
    review_count: 542,
    is_featured: true,
    is_new: false,
    is_trending: true,
    category_slug: "casual",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=80",
    ],
    variants: [["7", "Bone White", "#F9F9F9", 25], ["8", "Midnight Grey", "#37474F", 20], ["9", "Vachetta Tan", "#D2B48C", 18], ["10", "Bone White", "#F9F9F9", 15]],
  },
  {
    name: "Summit Ridge Pro",
    slug: "summit-ridge-pro",
    brand: "Merchant's Delight",
    description: "Fully waterproof hiking boot with Vibram® Megagrip outsole for extreme traction.",
    long_description: "Conquer any peak with the Summit Ridge Pro. Featuring a GORE-TEX® waterproof membrane and a rugged Vibram® Megagrip outsole for uncompromising traction on wet and dry surfaces. The TPU heel cradle provides stability on technical descents, while the gusseted tongue keeps debris out.",
    price: 279,
    original_price: 329,
    rating: 4.9,
    review_count: 215,
    is_new: true,
    is_featured: true,
    is_trending: true,
    category_slug: "hiking",
    images: [
      "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=1200&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80",
    ],
    variants: [["8", "Evergreen", "#2E7D32", 10], ["9", "Earth Brown", "#5D4037", 12], ["10", "Slate Blue", "#455A64", 8], ["11", "Evergreen", "#2E7D32", 6]],
  },
  {
    name: "Core Trainer X1",
    slug: "core-trainer-x1",
    brand: "Merchant's Delight",
    description: "High-performance cross-training shoe designed for stability and explosive movement.",
    long_description: "The Core Trainer X1 is the ultimate gym partner. A flat, wide outsole provides a stable base for heavy lifting, while the flexible forefoot allows for natural movement during agility drills. The high-abrasion mesh upper stands up to rope climbs and intense lateral movements.",
    price: 139,
    original_price: 159,
    rating: 4.8,
    review_count: 864,
    is_new: false,
    is_featured: true,
    is_trending: false,
    category_slug: "training",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&q=80",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1200&q=80",
    ],
    variants: [["7", "Stealth Black", "#0A0A0A", 18], ["8", "Cobalt Blue", "#1976D2", 15], ["9", "Neon Lime", "#C6FF00", 12], ["10", "Stealth Black", "#0A0A0A", 10]],
  },
  {
    name: "Heritage Chelsea Boot",
    slug: "heritage-chelsea-boot",
    brand: "Merchant's Delight",
    description: "Italian suede Chelsea boot handcrafted with Goodyear welt construction.",
    long_description: "A masterclass in luxury footwear. The Heritage Chelsea Boot is handcrafted in Italy from premium water-resistant suede. Features a classic Goodyear welt for durability and easy resoling, a full leather lining for breathability, and custom-woven side elastics for a perfect fit.",
    price: 389,
    original_price: 449,
    rating: 5.0,
    review_count: 92,
    is_new: true,
    is_featured: true,
    is_trending: true,
    category_slug: "luxury",
    images: [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80",
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1200&q=80",
    ],
    variants: [["8", "Chocolate Suede", "#3E2723", 5], ["9", "Sand Suede", "#D7CCC8", 7], ["10", "Black Suede", "#121212", 4], ["11", "Chocolate Suede", "#3E2723", 3]],
  },
  {
    name: "Classic Cap-Toe Oxford",
    slug: "classic-cap-toe-oxford",
    brand: "Merchant's Delight",
    description: "Traditional formal oxford handcrafted from premium French box calf leather.",
    long_description: "The definitive business shoe. Our Classic Cap-Toe Oxford features a timeless silhouette, meticulous hand-burnished details, and a high-density cork filling that molds to your feet for custom comfort. Perfect for the boardroom or any formal occasion.",
    price: 329,
    original_price: 379,
    rating: 4.9,
    review_count: 156,
    is_new: false,
    is_featured: true,
    is_trending: false,
    category_slug: "office",
    images: [
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1200&q=80",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&q=80",
    ],
    variants: [["8", "Espresso", "#4A3426", 8], ["9", "Jet Black", "#111111", 10], ["10", "Deep Burgundy", "#4A0E0E", 6], ["11", "Jet Black", "#111111", 5]],
  },
];

export function buildProductSeed() {
  const now = new Date().toISOString();
  const products = [];
  const productImages = [];
  const productVariants = [];

  for (const entry of baseProducts) {
    const productId = randomUUID();
    products.push({
      id: productId,
      category_id: categoryIdBySlug[entry.category_slug] || null,
      name: entry.name,
      slug: entry.slug,
      brand: entry.brand,
      description: entry.description,
      long_description: entry.long_description,
      price: entry.price,
      original_price: entry.original_price ?? 0,
      rating: entry.rating,
      review_count: entry.review_count,
      is_new: entry.is_new,
      is_featured: entry.is_featured,
      is_trending: entry.is_trending,
      created_at: now,
      updated_at: now,
    });

    entry.images.forEach((image_url, position) => {
      productImages.push({ id: randomUUID(), product_id: productId, image_url, position, created_at: now });
    });

    entry.variants.forEach(([size, color, color_hex, stock]) => {
      productVariants.push({ id: randomUUID(), product_id: productId, size, color, color_hex, stock, price: entry.price, created_at: now });
    });
  }

  return { products, productImages, productVariants };
}

export function buildShippingSeed() {
  const now = new Date().toISOString();
  return [
    { id: randomUUID(), carrier: "USPS", name: "Ground Advantage", description: "Affordable domestic ground shipping with tracking", price: 8.49, estimated_days: "5-7 business days", min_order_amount: 150, is_active: true, country_code: "US", created_at: now, updated_at: now },
    { id: randomUUID(), carrier: "USPS", name: "Priority Mail", description: "Fast domestic delivery with tracking and insurance", price: 15.99, estimated_days: "2-3 business days", min_order_amount: 250, is_active: true, country_code: "US", created_at: now, updated_at: now },
    { id: randomUUID(), carrier: "DHL", name: "Express Economy", description: "Cost-effective international express shipping", price: 29.99, estimated_days: "5-8 business days", min_order_amount: null, is_active: true, country_code: "ALL", created_at: now, updated_at: now },
    { id: randomUUID(), carrier: "DHL", name: "Express Worldwide", description: "Fast international express delivery", price: 49.99, estimated_days: "2-4 business days", min_order_amount: 400, is_active: true, country_code: "ALL", created_at: now, updated_at: now },
  ];
}
