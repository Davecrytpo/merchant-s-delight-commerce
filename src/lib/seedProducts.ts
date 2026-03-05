import { supabase } from "@/integrations/supabase/client";

type Colorway = { name: string; hex: string };

type SeedProduct = {
  name: string;
  slug: string;
  brand: string;
  description: string;
  long_description: string;
  price: number;
  original_price?: number;
  rating: number;
  review_count: number;
  is_new?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  category_slug: "running" | "casual" | "training" | "lifestyle";
  images: string[];
  colorways: Colorway[];
  sizes: string[];
};

const realProducts: SeedProduct[] = [
  {
    name: "Air Velocity Pro",
    slug: "air-velocity-pro",
    brand: "ShoeShop",
    description: "Engineered for speed with responsive cushioning and a breathable mesh upper.",
    long_description:
      "The Air Velocity Pro represents the pinnacle of running shoe technology. Featuring our proprietary ReactFoam midsole that returns 85% of energy with every stride. The lightweight engineered mesh upper provides targeted support and breathability where you need it most.",
    price: 189.0,
    original_price: 229.0,
    rating: 4.8,
    review_count: 342,
    is_new: true,
    is_featured: true,
    is_trending: true,
    category_slug: "running",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
    ],
    colorways: [
      { name: "Jet Black", hex: "#111111" },
      { name: "Crimson Red", hex: "#C51F2A" },
      { name: "Arctic White", hex: "#F5F5F5" },
    ],
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
  },
  {
    name: "Urban Street Classic",
    slug: "urban-street-classic",
    brand: "ShoeShop",
    description: "Timeless street style meets modern comfort technology.",
    long_description:
      "The Urban Street Classic blends heritage design with cutting-edge comfort. Premium full-grain leather upper ages beautifully over time, while the hidden Air-Sole unit provides all-day cushioning for your city adventures.",
    price: 129.0,
    rating: 4.6,
    review_count: 891,
    is_featured: true,
    category_slug: "casual",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=80",
      "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=1200&q=80",
    ],
    colorways: [
      { name: "Classic White", hex: "#FFFFFF" },
      { name: "Coffee Brown", hex: "#6B4423" },
      { name: "Slate Grey", hex: "#5F6A72" },
    ],
    sizes: ["7", "8", "9", "10", "11", "12"],
  },
  {
    name: "Summit Trail X",
    slug: "summit-trail-x",
    brand: "ShoeShop",
    description: "Conquer any terrain with waterproof protection and aggressive traction.",
    long_description:
      "Built for the most demanding trails, the Summit Trail X features a waterproof membrane that keeps your feet dry in any weather. The multi-directional lug pattern ensures steady footing on mud, loose rock, and slippery surfaces.",
    price: 219.0,
    original_price: 259.0,
    rating: 4.9,
    review_count: 156,
    is_new: true,
    is_trending: true,
    category_slug: "running",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80",
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&q=80",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1200&q=80",
    ],
    colorways: [
      { name: "Forest Green", hex: "#1F5D3D" },
      { name: "Midnight Navy", hex: "#1F2A44" },
      { name: "Sandstone", hex: "#C4A484" },
    ],
    sizes: ["8", "9", "10", "11", "12", "13"],
  },
  {
    name: "Flex Training Elite",
    slug: "flex-training-elite",
    brand: "ShoeShop",
    description: "Versatile training shoe built for gym workouts and cross-training.",
    long_description:
      "The Flex Training Elite is designed for athletes who demand versatility. A wide, flat outsole provides a stable base for lifting, while the flexible forefoot allows for natural movement during agility drills and cardio.",
    price: 149.0,
    rating: 4.7,
    review_count: 567,
    is_featured: true,
    category_slug: "training",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80",
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1200&q=80",
    ],
    colorways: [
      { name: "Onyx Black", hex: "#101214" },
      { name: "Electric Blue", hex: "#2D6CDF" },
      { name: "Volt Lime", hex: "#B8D430" },
    ],
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
  },
  {
    name: "Luxe Leather Boot",
    slug: "luxe-leather-boot",
    brand: "ShoeShop",
    description: "Handcrafted premium leather boot with Goodyear welt construction.",
    long_description:
      "Each pair of Luxe Leather Boots is handcrafted by skilled artisans using time-honored techniques. The premium Italian leather upper is paired with a durable Vibram outsole, making these boots as tough as they are elegant.",
    price: 349.0,
    rating: 4.9,
    review_count: 89,
    is_trending: true,
    category_slug: "lifestyle",
    images: [
      "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=1200&q=80",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=80",
      "https://images.unsplash.com/photo-1626947346165-4c2288dadc2a?w=1200&q=80",
    ],
    colorways: [
      { name: "Dark Brown", hex: "#4E342E" },
      { name: "Tan", hex: "#B9895B" },
      { name: "Black", hex: "#1C1C1C" },
    ],
    sizes: ["8", "9", "10", "11", "12", "13"],
  },
  {
    name: "Cloud Walker",
    slug: "cloud-walker",
    brand: "ShoeShop",
    description: "Ultra-lightweight slip-on with cloud-like cushioning for all-day wear.",
    long_description:
      "Step into pure comfort with the Cloud Walker. Our lightest shoe ever, featuring a breathable knit upper that fits like a sock and a revolutionary foam outsole that makes you feel like you're walking on air.",
    price: 99.0,
    original_price: 119.0,
    rating: 4.5,
    review_count: 1203,
    category_slug: "casual",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&q=80",
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=1200&q=80",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1200&q=80",
    ],
    colorways: [
      { name: "Cloud White", hex: "#F3F5F7" },
      { name: "Sky Blue", hex: "#78A7D7" },
      { name: "Rose Pink", hex: "#D4879C" },
    ],
    sizes: ["6", "7", "8", "9", "10", "11"],
  },
  {
    name: "Pro Court Ace",
    slug: "pro-court-ace",
    brand: "ShoeShop",
    description: "Court-ready performance with ankle support and responsive cushioning.",
    long_description:
      "Dominate the court with the Pro Court Ace. High-top design provides superior ankle support for lateral movements, while the ZoomAir unit in the heel delivers explosive energy return on every jump.",
    price: 179.0,
    rating: 4.7,
    review_count: 234,
    is_new: true,
    category_slug: "training",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200&q=80",
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80",
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1200&q=80",
    ],
    colorways: [
      { name: "Court White", hex: "#FAFAFA" },
      { name: "Royal Blue", hex: "#2256A3" },
      { name: "Infrared", hex: "#E83A30" },
    ],
    sizes: ["8", "9", "10", "11", "12", "13", "14"],
  },
  {
    name: "Retro Runner '90",
    slug: "retro-runner-90",
    brand: "ShoeShop",
    description: "90s-inspired runner with vintage aesthetics and modern comfort.",
    long_description:
      "A love letter to the golden era of running shoes. The Retro Runner '90 features authentic vintage materials and colorways combined with modern EVA midsole technology for a ride that's classic yet comfortable.",
    price: 139.0,
    rating: 4.4,
    review_count: 445,
    is_featured: true,
    is_trending: true,
    category_slug: "lifestyle",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80",
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=1200&q=80",
    ],
    colorways: [
      { name: "Vintage White", hex: "#F4F0E6" },
      { name: "Navy Blue", hex: "#243B6B" },
      { name: "Burgundy", hex: "#6F1D2A" },
    ],
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
  },
];

export async function seedProducts(clearExisting = false) {
  console.log("Starting seeding...");

  if (clearExisting) {
    console.log("Clearing existing data...");
    await supabase
      .from("product_variants")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("product_images")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("reviews")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("categories")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const categoriesToSeed = [
    {
      name: "Running",
      slug: "running",
      description: "Performance shoes for every mile",
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
    },
    {
      name: "Casual",
      slug: "casual",
      description: "Daily style and comfort",
      image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80",
    },
    {
      name: "Training",
      slug: "training",
      description: "Cross-training and gym performance",
      image_url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80",
    },
    {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Street-ready fashion",
      image_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1000&q=80",
    },
  ];

  for (const cat of categoriesToSeed) {
    await supabase.from("categories").upsert(cat, { onConflict: "slug" });
  }

  const { data: categories } = await supabase.from("categories").select("*");
  if (!categories) {
    console.error("Failed to fetch categories");
    return;
  }

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  for (const product of realProducts) {
    const catId = categoryMap.get(product.category_slug) || null;
    const { images, colorways, sizes, ...productData } = product;

    const { data: p, error } = await supabase
      .from("products")
      .upsert(
        {
          ...productData,
          category_id: catId,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (error) {
      console.error(`Error seeding product ${product.name}:`, error);
      continue;
    }

    if (p) {
      await supabase.from("product_images").delete().eq("product_id", p.id);
      const { error: imageError } = await supabase.from("product_images").insert(
        images.map((imageUrl, index) => ({
          product_id: p.id,
          image_url: imageUrl,
          position: index,
        }))
      );
      if (imageError) {
        console.error(`Error seeding images for ${product.name}:`, imageError);
      }

      await supabase.from("product_variants").delete().eq("product_id", p.id);
      const variantRows = colorways.flatMap((color, colorIndex) =>
        sizes.map((size, sizeIndex) => ({
          product_id: p.id,
          size,
          color: color.name,
          color_hex: color.hex,
          price: product.price,
          stock: Math.max(8, 40 - colorIndex * 6 - sizeIndex),
        }))
      );

      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(variantRows);
      if (variantError) {
        console.error(`Error seeding variants for ${product.name}:`, variantError);
      }
    }
  }

  console.log("Seeding complete!");
}
