import { randomUUID } from "node:crypto";

export const defaultCategories = [
  { id: randomUUID(), name: "Running", slug: "running", description: "Performance running shoes", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80" },
  { id: randomUUID(), name: "Casual", slug: "casual", description: "Everyday comfort and style", image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80" },
  { id: randomUUID(), name: "Hiking", slug: "hiking", description: "Outdoor and trail-ready footwear", image_url: "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=1000&q=80" },
  { id: randomUUID(), name: "Training", slug: "training", description: "Gym and cross-training essentials", image_url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1000&q=80" },
  { id: randomUUID(), name: "Luxury", slug: "luxury", description: "High-end premium leather footwear", image_url: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1000&q=80" },
  { id: randomUUID(), name: "Office", slug: "office", description: "Formal and business-ready shoes", image_url: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1000&q=80" },
  { id: randomUUID(), name: "Kids", slug: "kids", description: "Durable and comfortable kids footwear", image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80" },
  { id: randomUUID(), name: "Lifestyle", slug: "lifestyle", description: "Street-ready fashion sneakers", image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1000&q=80" },
];

const categoryIdBySlug = Object.fromEntries(defaultCategories.map((category) => [category.slug, category.id]));

const baseProducts = [
  {
    name: "Air Velocity Pro",
    slug: "air-velocity-pro",
    brand: "Merchant's Delight",
    description: "Engineered for speed with responsive cushioning and a breathable upper.",
    long_description: "The Air Velocity Pro blends lightweight support, stable landings, and responsive foam for daily training and race-day pace.",
    price: 189,
    original_price: 229,
    rating: 4.8,
    review_count: 342,
    is_new: true,
    is_featured: true,
    is_trending: true,
    category_slug: "running",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80",
    ],
    variants: [["8", "Jet Black", "#111111", 18], ["9", "Crimson Red", "#C51F2A", 16], ["10", "Arctic White", "#F5F5F5", 20], ["11", "Jet Black", "#111111", 14]],
  },
  {
    name: "Urban Street Classic",
    slug: "urban-street-classic",
    brand: "Merchant's Delight",
    description: "Timeless street style with all-day comfort.",
    long_description: "Urban Street Classic blends heritage design and modern comfort for everyday wear with durable materials and clean lines.",
    price: 129,
    original_price: 149,
    rating: 4.6,
    review_count: 891,
    is_featured: true,
    is_new: false,
    is_trending: true,
    category_slug: "casual",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=80",
    ],
    variants: [["7", "Classic White", "#FFFFFF", 22], ["8", "Slate Grey", "#5F6A72", 20], ["9", "Coffee Brown", "#6B4423", 18], ["10", "Classic White", "#FFFFFF", 17]],
  },
  {
    name: "Summit Trail X",
    slug: "summit-trail-x",
    brand: "Merchant's Delight",
    description: "Water-resistant trail shoe built for rugged terrain.",
    long_description: "Summit Trail X features aggressive traction, reinforced support, and weather-ready materials for demanding hikes and rough trails.",
    price: 219,
    original_price: 259,
    rating: 4.9,
    review_count: 156,
    is_new: true,
    is_featured: false,
    is_trending: true,
    category_slug: "hiking",
    images: [
      "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=1200&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80",
    ],
    variants: [["8", "Forest Green", "#1F5D3D", 11], ["9", "Sandstone", "#C4A484", 10], ["10", "Midnight Navy", "#1F2A44", 9], ["11", "Forest Green", "#1F5D3D", 8]],
  },
  {
    name: "Flex Training Elite",
    slug: "flex-training-elite",
    brand: "Merchant's Delight",
    description: "Versatile training shoe for gym and cross-training.",
    long_description: "Flex Training Elite delivers stability for strength work and flexibility for movement drills across mixed workout sessions.",
    price: 149,
    original_price: 169,
    rating: 4.7,
    review_count: 567,
    is_new: false,
    is_featured: true,
    is_trending: false,
    category_slug: "training",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&q=80",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1200&q=80",
    ],
    variants: [["7", "Onyx Black", "#101214", 15], ["8", "Electric Blue", "#2D6CDF", 14], ["9", "Volt Lime", "#B8D430", 12], ["10", "Onyx Black", "#101214", 11]],
  },
  {
    name: "Luxe Leather Boot",
    slug: "luxe-leather-boot",
    brand: "Merchant's Delight",
    description: "Premium handcrafted leather boot with luxury finish.",
    long_description: "Luxe Leather Boot pairs premium leather, robust construction, and a comfort-focused insole for elevated everyday wear.",
    price: 349,
    original_price: 399,
    rating: 4.9,
    review_count: 89,
    is_new: false,
    is_featured: true,
    is_trending: true,
    category_slug: "luxury",
    images: [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80",
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1200&q=80",
    ],
    variants: [["8", "Dark Brown", "#4E342E", 8], ["9", "Black", "#1C1C1C", 7], ["10", "Tan", "#B9895B", 6], ["11", "Dark Brown", "#4E342E", 5]],
  },
  {
    name: "Executive Oxford",
    slug: "executive-oxford",
    brand: "Merchant's Delight",
    description: "Elegant office oxford for business and formal wear.",
    long_description: "Executive Oxford brings a refined silhouette and polished finish for boardroom-ready style with day-long comfort.",
    price: 289,
    original_price: 329,
    rating: 4.9,
    review_count: 128,
    is_new: false,
    is_featured: true,
    is_trending: false,
    category_slug: "office",
    images: [
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1200&q=80",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&q=80",
    ],
    variants: [["8", "Espresso", "#4A3426", 10], ["9", "Black", "#111111", 9], ["10", "Cognac", "#9C6A3E", 7], ["11", "Black", "#111111", 6]],
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
