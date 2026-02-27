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

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
}

export const SHOE_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80",
  "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
  "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
  "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80",
  "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
];

const SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"];
const COLORS = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#16a34a" },
];

function makeVariants(price: number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const colorSubset = COLORS.slice(0, 2 + Math.floor(Math.random() * 3));
  colorSubset.forEach((color) => {
    SIZES.slice(0, 6 + Math.floor(Math.random() * 5)).forEach((size) => {
      variants.push({
        id: `${color.name}-${size}`.toLowerCase().replace(/\s/g, "-"),
        size,
        color: color.name,
        colorHex: color.hex,
        stock: Math.floor(Math.random() * 20) + 1,
        price,
      });
    });
  });
  return variants;
}

export const products: Product[] = [
  {
    id: "1", name: "Air Velocity Pro", slug: "air-velocity-pro", brand: "ShoeShop",
    category: "Running", description: "Engineered for speed with responsive cushioning and a breathable mesh upper.",
    longDescription: "The Air Velocity Pro represents the pinnacle of running shoe technology. Featuring our proprietary ReactFoam™ midsole that returns 85% of energy with every stride. The engineered mesh upper provides targeted ventilation zones while maintaining structural support. A carbon fiber plate embedded in the midsole propels you forward, making this the perfect shoe for tempo runs and race day.",
    price: 189, originalPrice: 229, images: [SHOE_IMAGES[0], SHOE_IMAGES[1], SHOE_IMAGES[2], SHOE_IMAGES[3]],
    variants: makeVariants(189), rating: 4.8, reviewCount: 342, tags: ["running", "performance", "lightweight"],
    isNew: true, isFeatured: true, isTrending: true,
  },
  {
    id: "2", name: "Urban Street Classic", slug: "urban-street-classic", brand: "ShoeShop",
    category: "Casual", description: "Timeless street style meets modern comfort technology.",
    longDescription: "The Urban Street Classic blends heritage design with cutting-edge comfort. Premium full-grain leather upper ages beautifully over time. OrthoLite® insole provides all-day cushioning. Vulcanized rubber outsole offers superior grip on city streets. Available in a curated palette of classic colorways.",
    price: 129, images: [SHOE_IMAGES[4], SHOE_IMAGES[5], SHOE_IMAGES[6]],
    variants: makeVariants(129), rating: 4.6, reviewCount: 891, tags: ["casual", "street", "classic"],
    isFeatured: true,
  },
  {
    id: "3", name: "Summit Trail X", slug: "summit-trail-x", brand: "ShoeShop",
    category: "Hiking", description: "Conquer any terrain with waterproof protection and aggressive traction.",
    longDescription: "Built for the most demanding trails, the Summit Trail X features a GORE-TEX® waterproof membrane that keeps your feet dry in any weather. The Vibram® Megagrip outsole provides exceptional traction on wet and dry surfaces. A TPU heel cage locks your foot in place during technical descents.",
    price: 219, originalPrice: 259, images: [SHOE_IMAGES[7], SHOE_IMAGES[8], SHOE_IMAGES[0]],
    variants: makeVariants(219), rating: 4.9, reviewCount: 156, tags: ["hiking", "outdoor", "waterproof"],
    isNew: true, isTrending: true,
  },
  {
    id: "4", name: "Flex Training Elite", slug: "flex-training-elite", brand: "ShoeShop",
    category: "Training", description: "Versatile training shoe built for gym workouts and cross-training.",
    longDescription: "The Flex Training Elite is designed for athletes who demand versatility. A wide, flat outsole provides a stable base for lifting, while the flexible forefoot allows natural movement during agility drills. The breathable knit upper wraps your foot in adaptive comfort.",
    price: 149, images: [SHOE_IMAGES[9], SHOE_IMAGES[10], SHOE_IMAGES[11]],
    variants: makeVariants(149), rating: 4.7, reviewCount: 567, tags: ["training", "gym", "cross-training"],
    isFeatured: true,
  },
  {
    id: "5", name: "Luxe Leather Boot", slug: "luxe-leather-boot", brand: "ShoeShop",
    category: "Boots", description: "Handcrafted premium leather boot with Goodyear welt construction.",
    longDescription: "Each pair of Luxe Leather Boots is handcrafted by skilled artisans using time-honored techniques. The Goodyear welt construction allows for resoling, making these boots a lifetime investment. Full-grain Horween leather develops a rich patina over time.",
    price: 349, images: [SHOE_IMAGES[5], SHOE_IMAGES[4], SHOE_IMAGES[7]],
    variants: makeVariants(349), rating: 4.9, reviewCount: 89, tags: ["boots", "luxury", "leather"],
    isTrending: true,
  },
  {
    id: "6", name: "Cloud Walker", slug: "cloud-walker", brand: "ShoeShop",
    category: "Casual", description: "Ultra-lightweight slip-on with cloud-like cushioning for all-day wear.",
    longDescription: "Step into pure comfort with the Cloud Walker. Our lightest shoe ever at just 180g, featuring a dual-density foam midsole that absorbs shock and returns energy. The sock-like knit upper stretches to fit your foot perfectly.",
    price: 99, originalPrice: 119, images: [SHOE_IMAGES[1], SHOE_IMAGES[3], SHOE_IMAGES[6]],
    variants: makeVariants(99), rating: 4.5, reviewCount: 1203, tags: ["casual", "comfort", "lightweight"],
  },
  {
    id: "7", name: "Pro Court Ace", slug: "pro-court-ace", brand: "ShoeShop",
    category: "Basketball", description: "Court-ready performance with ankle support and responsive cushioning.",
    longDescription: "Dominate the court with the Pro Court Ace. High-top design provides superior ankle support during quick cuts and jumps. Zoom Air units in the forefoot and heel deliver responsive cushioning. Herringbone traction pattern grips the court in all directions.",
    price: 179, images: [SHOE_IMAGES[8], SHOE_IMAGES[0], SHOE_IMAGES[2]],
    variants: makeVariants(179), rating: 4.7, reviewCount: 234, tags: ["basketball", "performance", "court"],
    isNew: true,
  },
  {
    id: "8", name: "Retro Runner '90", slug: "retro-runner-90", brand: "ShoeShop",
    category: "Lifestyle", description: "90s-inspired runner with vintage aesthetics and modern comfort.",
    longDescription: "A love letter to the golden era of running shoes. The Retro Runner '90 combines authentic vintage design details with today's comfort technology. Suede and mesh upper materials recall the originals, while a modern EVA midsole keeps your feet happy.",
    price: 139, images: [SHOE_IMAGES[10], SHOE_IMAGES[11], SHOE_IMAGES[9]],
    variants: makeVariants(139), rating: 4.4, reviewCount: 445, tags: ["lifestyle", "retro", "vintage"],
    isFeatured: true, isTrending: true,
  },
  {
    id: "9", name: "Aqua Sprint", slug: "aqua-sprint", brand: "ShoeShop",
    category: "Running", description: "Water-resistant running shoe for training in any weather condition.",
    longDescription: "Don't let rain stop your training. The Aqua Sprint features a DWR-treated mesh upper that repels water while maintaining breathability. Reflective details keep you visible in low-light conditions. Continental™ rubber outsole grips wet roads with confidence.",
    price: 169, originalPrice: 199, images: [SHOE_IMAGES[2], SHOE_IMAGES[6], SHOE_IMAGES[8]],
    variants: makeVariants(169), rating: 4.6, reviewCount: 178, tags: ["running", "waterproof", "all-weather"],
  },
  {
    id: "10", name: "Skate Culture", slug: "skate-culture", brand: "ShoeShop",
    category: "Skateboarding", description: "Durable skate shoe with vulcanized sole and reinforced ollie area.",
    longDescription: "Built to withstand the punishment of skating. Triple-stitched suede upper resists abrasion. Vulcanized construction provides superior board feel. Extra padding in the tongue and collar for impact protection during hard landings.",
    price: 89, images: [SHOE_IMAGES[3], SHOE_IMAGES[5], SHOE_IMAGES[1]],
    variants: makeVariants(89), rating: 4.3, reviewCount: 612, tags: ["skateboarding", "durable", "street"],
  },
  {
    id: "11", name: "Zen Walker Pro", slug: "zen-walker-pro", brand: "ShoeShop",
    category: "Walking", description: "Ergonomic walking shoe designed with podiatrist input for natural stride.",
    longDescription: "Walk further, feel better. Developed in collaboration with leading podiatrists, the Zen Walker Pro promotes a natural gait cycle. The rocker bottom sole reduces pressure on joints. Memory foam insole molds to your unique foot shape.",
    price: 159, images: [SHOE_IMAGES[7], SHOE_IMAGES[9], SHOE_IMAGES[11]],
    variants: makeVariants(159), rating: 4.8, reviewCount: 923, tags: ["walking", "comfort", "ergonomic"],
  },
  {
    id: "12", name: "Titanium Track", slug: "titanium-track", brand: "ShoeShop",
    category: "Running", description: "Competition-grade track shoe with carbon plate for explosive speed.",
    longDescription: "Engineered for race day performance. Full-length carbon fiber plate stores and releases energy with every toe-off. ZoomX foam provides our highest energy return ever. The result: measurably faster times across distances from 5K to the marathon.",
    price: 249, images: [SHOE_IMAGES[0], SHOE_IMAGES[2], SHOE_IMAGES[10]],
    variants: makeVariants(249), rating: 4.9, reviewCount: 67, tags: ["running", "competition", "carbon-plate"],
    isNew: true, isTrending: true,
  },
];

export const categories = [
  { name: "Running", slug: "running", count: 3, image: SHOE_IMAGES[0] },
  { name: "Casual", slug: "casual", count: 2, image: SHOE_IMAGES[4] },
  { name: "Hiking", slug: "hiking", count: 1, image: SHOE_IMAGES[7] },
  { name: "Training", slug: "training", count: 1, image: SHOE_IMAGES[9] },
  { name: "Boots", slug: "boots", count: 1, image: SHOE_IMAGES[5] },
  { name: "Basketball", slug: "basketball", count: 1, image: SHOE_IMAGES[8] },
  { name: "Lifestyle", slug: "lifestyle", count: 1, image: SHOE_IMAGES[10] },
  { name: "Skateboarding", slug: "skateboarding", count: 1, image: SHOE_IMAGES[3] },
  { name: "Walking", slug: "walking", count: 1, image: SHOE_IMAGES[11] },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1", title: "The Science Behind Running Shoe Cushioning", slug: "science-behind-running-shoe-cushioning",
    excerpt: "Discover how modern foam technologies are revolutionizing the way we run.",
    content: "Running shoe technology has evolved dramatically over the past decade. From Nike's Vaporfly revolution to Adidas's Boost foam, we explore the materials science that makes today's shoes faster and more comfortable than ever...",
    image: SHOE_IMAGES[0], author: "Dr. Sarah Chen", date: "2026-02-20", category: "Technology",
  },
  {
    id: "2", title: "How to Choose the Right Shoe for Your Foot Type", slug: "choose-right-shoe-foot-type",
    excerpt: "Understanding pronation, arch type, and fit can transform your comfort.",
    content: "Every foot is unique, and understanding yours is the first step to finding the perfect shoe. We break down the three main arch types and explain how each affects your gait...",
    image: SHOE_IMAGES[4], author: "Mike Thompson", date: "2026-02-15", category: "Guide",
  },
  {
    id: "3", title: "Sustainable Footwear: The Future of Fashion", slug: "sustainable-footwear-future",
    excerpt: "How brands are reducing their environmental impact without compromising style.",
    content: "The footwear industry is undergoing a green revolution. From recycled ocean plastics to plant-based leathers, discover the innovations making shoes more sustainable...",
    image: SHOE_IMAGES[7], author: "Emma Rodriguez", date: "2026-02-10", category: "Sustainability",
  },
  {
    id: "4", title: "Sneaker Culture: From Sport to Street", slug: "sneaker-culture-sport-to-street",
    excerpt: "How athletic shoes became the defining fashion statement of our generation.",
    content: "What started as functional athletic gear has become a global cultural phenomenon. We trace the journey of sneakers from the basketball court to the runway...",
    image: SHOE_IMAGES[3], author: "James Park", date: "2026-02-05", category: "Culture",
  },
];

export const sampleOrders: Order[] = [
  {
    id: "ORD-2026-001", items: [], status: "delivered", total: 318,
    createdAt: "2026-02-20", trackingNumber: "TRK-9876543210", shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "ORD-2026-002", items: [], status: "shipped", total: 219,
    createdAt: "2026-02-24", trackingNumber: "TRK-1234567890", shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
  },
  {
    id: "ORD-2026-003", items: [], status: "processing", total: 149,
    createdAt: "2026-02-26", shippingAddress: "789 Pine Rd, Chicago, IL 60601",
  },
];
