export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
  trackingNumber?: string;
  shippingAddress: string;
}

export const SHOE_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80",
  "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=800&q=80",
  "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
  "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&q=80",
  "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80",
  "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80",
  "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=800&q=80",
  "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&q=80",
  "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80",
];

const SIZES = ["7", "8", "9", "10", "11", "12"];

export const products: Product[] = [
  {
    id: "p1", name: "Apex Velocity Elite", slug: "apex-velocity-elite", brand: "Merchant's Delight",
    category: "Running", description: "Our most advanced running shoe yet, featuring carbon-fiber propulsion technology.",
    longDescription: "The Apex Velocity Elite is engineered for the podium. Featuring our proprietary AeroFoam™ midsole for 90% energy return and an embedded full-length carbon plate for explosive toe-offs. The ultra-breathable WarpKnit upper provides a second-skin fit that stays cool during the most intense marathons.",
    price: 249, originalPrice: 299, images: [SHOE_IMAGES[0], SHOE_IMAGES[1]],
    variants: SIZES.map(s => ({ id: `v1-${s}`, size: s, color: "Titanium Black", colorHex: "#111111", stock: 15, price: 249 })),
    rating: 4.9, reviewCount: 128, tags: ["running", "carbon-plate", "elite"],
    isNew: true, isFeatured: true, isTrending: true,
  },
  {
    id: "p2", name: "Urban Heritage Low", slug: "urban-heritage-low", brand: "Merchant's Delight",
    category: "Casual", description: "Premium full-grain leather sneaker handcrafted for ultimate daily comfort.",
    longDescription: "The Urban Heritage Low redefines the classic sneaker. Hand-stitched from premium Italian calfskin leather that develops a unique patina over time. The anatomical footbed and reinforced heel cup ensure all-day support.",
    price: 169, originalPrice: 199, images: [SHOE_IMAGES[2], SHOE_IMAGES[3]],
    variants: SIZES.map(s => ({ id: `v2-${s}`, size: s, color: "Bone White", colorHex: "#F9F9F9", stock: 20, price: 169 })),
    rating: 4.7, reviewCount: 542, tags: ["casual", "leather", "handcrafted"],
    isFeatured: true, isTrending: true,
  },
  {
    id: "p3", name: "Summit Ridge Pro", slug: "summit-ridge-pro", brand: "Merchant's Delight",
    category: "Hiking", description: "Fully waterproof hiking boot with Vibram® Megagrip outsole for extreme traction.",
    longDescription: "Conquer any peak with the Summit Ridge Pro. Featuring a GORE-TEX® waterproof membrane and a rugged Vibram® Megagrip outsole for uncompromising traction on wet and dry surfaces.",
    price: 279, originalPrice: 329, images: [SHOE_IMAGES[4], SHOE_IMAGES[5]],
    variants: SIZES.map(s => ({ id: `v3-${s}`, size: s, color: "Evergreen", colorHex: "#2E7D32", stock: 10, price: 279 })),
    rating: 4.9, reviewCount: 215, tags: ["hiking", "waterproof", "vibram"],
    isNew: true, isFeatured: true, isTrending: true,
  },
  {
    id: "p4", name: "Core Trainer X1", slug: "core-trainer-x1", brand: "Merchant's Delight",
    category: "Training", description: "High-performance cross-training shoe designed for stability and explosive movement.",
    longDescription: "The Core Trainer X1 is the ultimate gym partner. A flat, wide outsole provides a stable base for heavy lifting, while the flexible forefoot allows for natural movement.",
    price: 139, originalPrice: 159, images: [SHOE_IMAGES[6], SHOE_IMAGES[7]],
    variants: SIZES.map(s => ({ id: `v4-${s}`, size: s, color: "Stealth Black", colorHex: "#0A0A0A", stock: 18, price: 139 })),
    rating: 4.8, reviewCount: 864, tags: ["training", "gym", "stability"],
    isFeatured: true,
  },
  {
    id: "p5", name: "Heritage Chelsea Boot", slug: "heritage-chelsea-boot", brand: "Merchant's Delight",
    category: "Luxury", description: "Italian suede Chelsea boot handcrafted with Goodyear welt construction.",
    longDescription: "A masterclass in luxury footwear. The Heritage Chelsea Boot is handcrafted in Italy from premium water-resistant suede. Features a classic Goodyear welt for durability.",
    price: 389, originalPrice: 449, images: [SHOE_IMAGES[8], SHOE_IMAGES[9]],
    variants: SIZES.map(s => ({ id: `v5-${s}`, size: s, color: "Chocolate Suede", colorHex: "#3E2723", stock: 7, price: 389 })),
    rating: 5.0, reviewCount: 92, tags: ["luxury", "suede", "handcrafted"],
    isNew: true, isFeatured: true, isTrending: true,
  },
  {
    id: "p6", name: "Classic Cap-Toe Oxford", slug: "classic-cap-toe-oxford", brand: "Merchant's Delight",
    category: "Office", description: "Traditional formal oxford handcrafted from premium French box calf leather.",
    longDescription: "The definitive business shoe. Our Classic Cap-Toe Oxford features a timeless silhouette, meticulous hand-burnished details, and a high-density cork filling.",
    price: 329, originalPrice: 379, images: [SHOE_IMAGES[10], SHOE_IMAGES[11]],
    variants: SIZES.map(s => ({ id: `v6-${s}`, size: s, color: "Jet Black", colorHex: "#111111", stock: 12, price: 329 })),
    rating: 4.9, reviewCount: 156, tags: ["office", "formal", "leather"],
    isFeatured: true,
  },
];

export const categories = [
  { name: "Running", slug: "running", count: 1, image: SHOE_IMAGES[0] },
  { name: "Casual", slug: "casual", count: 1, image: SHOE_IMAGES[2] },
  { name: "Hiking", slug: "hiking", count: 1, image: SHOE_IMAGES[4] },
  { name: "Training", slug: "training", count: 1, image: SHOE_IMAGES[6] },
  { name: "Luxury", slug: "luxury", count: 1, image: SHOE_IMAGES[8] },
  { name: "Office", slug: "office", count: 1, image: SHOE_IMAGES[10] },
];
