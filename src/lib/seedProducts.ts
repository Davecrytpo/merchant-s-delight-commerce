import { supabase } from "@/integrations/supabase/client";

const realProducts = [
  {
    name: "Air Velocity Pro",
    slug: "air-velocity-pro",
    brand: "ShoeShop",
    description: "Engineered for speed with responsive cushioning and a breathable mesh upper.",
    long_description: "The Air Velocity Pro represents the pinnacle of running shoe technology. Featuring our proprietary ReactFoam™ midsole that returns 85% of energy with every stride.",
    price: 189.00,
    original_price: 229.00,
    rating: 4.8,
    review_count: 342,
    is_new: true,
    is_featured: true,
    is_trending: true,
  },
  {
    name: "Urban Street Classic",
    slug: "urban-street-classic",
    brand: "ShoeShop",
    description: "Timeless street style meets modern comfort technology.",
    long_description: "The Urban Street Classic blends heritage design with cutting-edge comfort. Premium full-grain leather upper ages beautifully over time.",
    price: 129.00,
    rating: 4.6,
    review_count: 891,
    is_featured: true,
  },
  {
    name: "Summit Trail X",
    slug: "summit-trail-x",
    brand: "ShoeShop",
    description: "Conquer any terrain with waterproof protection and aggressive traction.",
    long_description: "Built for the most demanding trails, the Summit Trail X features a GORE-TEX® waterproof membrane that keeps your feet dry in any weather.",
    price: 219.00,
    original_price: 259.00,
    rating: 4.9,
    review_count: 156,
    is_new: true,
    is_trending: true,
  },
  {
    name: "Flex Training Elite",
    slug: "flex-training-elite",
    brand: "ShoeShop",
    description: "Versatile training shoe built for gym workouts and cross-training.",
    long_description: "The Flex Training Elite is designed for athletes who demand versatility. A wide, flat outsole provides a stable base for lifting.",
    price: 149.00,
    rating: 4.7,
    review_count: 567,
    is_featured: true,
  },
  {
    name: "Luxe Leather Boot",
    slug: "luxe-leather-boot",
    brand: "ShoeShop",
    description: "Handcrafted premium leather boot with Goodyear welt construction.",
    long_description: "Each pair of Luxe Leather Boots is handcrafted by skilled artisans using time-honored techniques.",
    price: 349.00,
    rating: 4.9,
    review_count: 89,
    is_trending: true,
  },
  {
    name: "Cloud Walker",
    slug: "cloud-walker",
    brand: "ShoeShop",
    description: "Ultra-lightweight slip-on with cloud-like cushioning for all-day wear.",
    long_description: "Step into pure comfort with the Cloud Walker. Our lightest shoe ever at just 180g.",
    price: 99.00,
    original_price: 119.00,
    rating: 4.5,
    review_count: 1203,
  },
  {
    name: "Pro Court Ace",
    slug: "pro-court-ace",
    brand: "ShoeShop",
    description: "Court-ready performance with ankle support and responsive cushioning.",
    long_description: "Dominate the court with the Pro Court Ace. High-top design provides superior ankle support.",
    price: 179.00,
    rating: 4.7,
    review_count: 234,
    is_new: true,
  },
  {
    name: "Retro Runner '90",
    slug: "retro-runner-90",
    brand: "ShoeShop",
    description: "90s-inspired runner with vintage aesthetics and modern comfort.",
    long_description: "A love letter to the golden era of running shoes. Authentically vintage.",
    price: 139.00,
    rating: 4.4,
    review_count: 445,
    is_featured: true,
    is_trending: true,
  },
];

export async function seedProducts() {
  // 1. Seed Categories if they don't exist
  const categoriesToSeed = [
    { name: "Running", slug: "running", description: "Performance shoes for every mile" },
    { name: "Casual", slug: "casual", description: "Daily style and comfort" },
    { name: "Training", slug: "training", description: "Cross-training and gym performance" },
    { name: "Lifestyle", slug: "lifestyle", description: "Street-ready fashion" }
  ];

  for (const cat of categoriesToSeed) {
    await supabase.from("categories").upsert(cat, { onConflict: 'slug' });
  }

  const { data: categories } = await supabase.from("categories").select("*");
  if (!categories) return;

  const runningCat = categories.find(c => c.slug === "running")?.id;
  const casualCat = categories.find(c => c.slug === "casual")?.id;
  const trainingCat = categories.find(c => c.slug === "training")?.id;

  for (const product of realProducts) {
    let catId = casualCat;
    if (product.name.includes("Runner") || product.name.includes("Velocity")) catId = runningCat;
    if (product.name.includes("Training")) catId = trainingCat;

    const { data: p, error } = await supabase.from("products").upsert({
      ...product,
      category_id: catId
    }, { onConflict: 'slug' }).select().single();

    if (p) {
      // Add a dummy image
      await supabase.from("product_images").upsert({
        product_id: p.id,
        image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80`,
        position: 0
      }, { onConflict: 'product_id,image_url' });
      
      // Add a variant
      await supabase.from("product_variants").upsert({
        product_id: p.id,
        size: "10",
        color: "Black",
        color_hex: "#000000",
        price: product.price,
        stock: 50
      }, { onConflict: 'product_id,size,color' });
    }
  }
  console.log("Seeding complete!");
}
