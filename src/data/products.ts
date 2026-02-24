export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  width: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  brand: string;
  category: string;
  tags: string[];
  images: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  status: "published" | "draft";
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { productName: string; variant: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt: string;
  shippingAddress: string;
}

const sizes = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];
const colors = ["Black", "White", "Red", "Navy"];

function makeVariants(basePrice: number, baseSku: string): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const colorSubset = colors.slice(0, 2 + Math.floor(Math.random() * 3));
  colorSubset.forEach((color) => {
    sizes.forEach((size) => {
      variants.push({
        id: `${baseSku}-${color}-${size}`.toLowerCase().replace(/\s/g, ""),
        sku: `${baseSku}-${color.substring(0, 3).toUpperCase()}-${size.replace("US ", "")}`,
        size,
        color,
        width: "Normal",
        price: basePrice,
        compareAtPrice: Math.random() > 0.5 ? basePrice + 20 + Math.floor(Math.random() * 30) : undefined,
        inventory: Math.floor(Math.random() * 50) + 5,
      });
    });
  });
  return variants;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Runner Pro",
    slug: "runner-pro",
    shortDescription: "Lightweight performance running shoe",
    description: "The Runner Pro delivers responsive cushioning and a breathable knit upper for your fastest runs. Engineered for neutral runners seeking speed and comfort.",
    brand: "ShoeShop",
    category: "Running",
    tags: ["running", "performance", "mens"],
    images: [],
    variants: makeVariants(129.99, "RNR-PRO"),
    rating: 4.7,
    reviewCount: 234,
    createdAt: "2025-12-01",
    status: "published",
  },
  {
    id: "2",
    name: "Urban Walker",
    slug: "urban-walker",
    shortDescription: "All-day comfort casual sneaker",
    description: "Step out in style with the Urban Walker. Premium suede upper, memory foam insole, and a flexible rubber outsole make this the perfect everyday shoe.",
    brand: "ShoeShop",
    category: "Casual",
    tags: ["casual", "everyday", "unisex"],
    images: [],
    variants: makeVariants(89.99, "URB-WLK"),
    rating: 4.5,
    reviewCount: 189,
    createdAt: "2025-11-15",
    status: "published",
  },
  {
    id: "3",
    name: "Heritage Boot",
    slug: "heritage-boot",
    shortDescription: "Classic leather lace-up boot",
    description: "Crafted from full-grain leather with Goodyear welt construction. The Heritage Boot ages beautifully and is built to last for years.",
    brand: "ShoeShop",
    category: "Boots",
    tags: ["boots", "leather", "mens"],
    images: [],
    variants: makeVariants(199.99, "HRT-BT"),
    rating: 4.8,
    reviewCount: 156,
    createdAt: "2025-10-20",
    status: "published",
  },
  {
    id: "4",
    name: "Canvas Classic",
    slug: "canvas-classic",
    shortDescription: "Timeless canvas sneaker",
    description: "The Canvas Classic brings retro style with modern comfort. Organic cotton upper, vulcanized rubber sole, and a relaxed fit for effortless style.",
    brand: "ShoeShop",
    category: "Casual",
    tags: ["casual", "canvas", "unisex"],
    images: [],
    variants: makeVariants(59.99, "CNV-CLC"),
    rating: 4.3,
    reviewCount: 312,
    createdAt: "2025-11-01",
    status: "published",
  },
  {
    id: "5",
    name: "Trail Blazer",
    slug: "trail-blazer",
    shortDescription: "Rugged trail running shoe",
    description: "Conquer any terrain with the Trail Blazer. Aggressive lugged outsole, waterproof membrane, and rock plate protection for the most demanding trails.",
    brand: "ShoeShop",
    category: "Running",
    tags: ["trail", "outdoor", "mens"],
    images: [],
    variants: makeVariants(149.99, "TRL-BLZ"),
    rating: 4.6,
    reviewCount: 98,
    createdAt: "2025-12-10",
    status: "published",
  },
  {
    id: "6",
    name: "Flex Trainer",
    slug: "flex-trainer",
    shortDescription: "Versatile training shoe",
    description: "From HIIT to weights, the Flex Trainer provides stable support and flexible movement. Flat outsole with multi-directional traction pattern.",
    brand: "ShoeShop",
    category: "Training",
    tags: ["training", "gym", "unisex"],
    images: [],
    variants: makeVariants(109.99, "FLX-TRN"),
    rating: 4.4,
    reviewCount: 145,
    createdAt: "2025-11-20",
    status: "draft",
  },
];

export const orders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Alex Johnson",
    customerEmail: "alex@example.com",
    items: [{ productName: "Runner Pro", variant: "Black / US 10", quantity: 1, price: 129.99 }],
    total: 139.98,
    status: "pending",
    createdAt: "2026-02-23",
    shippingAddress: "123 Main St, Portland, OR 97201",
  },
  {
    id: "ORD-002",
    customerName: "Sarah Chen",
    customerEmail: "sarah@example.com",
    items: [
      { productName: "Urban Walker", variant: "White / US 8", quantity: 1, price: 89.99 },
      { productName: "Canvas Classic", variant: "Navy / US 8", quantity: 2, price: 59.99 },
    ],
    total: 219.96,
    status: "processing",
    createdAt: "2026-02-22",
    shippingAddress: "456 Oak Ave, Seattle, WA 98101",
  },
  {
    id: "ORD-003",
    customerName: "Mike Rivera",
    customerEmail: "mike@example.com",
    items: [{ productName: "Heritage Boot", variant: "Black / US 11", quantity: 1, price: 199.99 }],
    total: 209.98,
    status: "shipped",
    createdAt: "2026-02-20",
    shippingAddress: "789 Pine Rd, Austin, TX 78701",
  },
  {
    id: "ORD-004",
    customerName: "Lisa Park",
    customerEmail: "lisa@example.com",
    items: [{ productName: "Trail Blazer", variant: "Red / US 9", quantity: 1, price: 149.99 }],
    total: 159.98,
    status: "delivered",
    createdAt: "2026-02-18",
    shippingAddress: "321 Elm Blvd, Denver, CO 80202",
  },
];
