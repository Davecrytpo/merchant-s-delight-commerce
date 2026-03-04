import { supabase } from "@/integrations/supabase/client";

const realProducts = [
  {
    name: "Air Velocity Pro",
    slug: "air-velocity-pro",
    brand: "ShoeShop",
    description: "Engineered for speed with responsive cushioning and a breathable mesh upper.",
    long_description: "The Air Velocity Pro represents the pinnacle of running shoe technology. Featuring our proprietary ReactFoam™ midsole that returns 85% of energy with every stride. The lightweight engineered mesh upper provides targeted support and breathability where you need it most.",
    price: 189.00,
    original_price: 229.00,
    rating: 4.8,
    review_count: 342,
    is_new: true,
    is_featured: true,
    is_trending: true,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
  },
  {
    name: "Urban Street Classic",
    slug: "urban-street-classic",
    brand: "ShoeShop",
    description: "Timeless street style meets modern comfort technology.",
    long_description: "The Urban Street Classic blends heritage design with cutting-edge comfort. Premium full-grain leather upper ages beautifully over time, while the hidden Air-Sole unit provides all-day cushioning for your city adventures.",
    price: 129.00,
    rating: 4.6,
    review_count: 891,
    is_featured: true,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b1ae77?w=800&q=80"
  },
  {
    name: "Summit Trail X",
    slug: "summit-trail-x",
    brand: "ShoeShop",
    description: "Conquer any terrain with waterproof protection and aggressive traction.",
    long_description: "Built for the most demanding trails, the Summit Trail X features a GORE-TEX® waterproof membrane that keeps your feet dry in any weather. The multi-directional lug pattern ensures steady footing on mud, loose rock, and slippery surfaces.",
    price: 219.00,
    original_price: 259.00,
    rating: 4.9,
    review_count: 156,
    is_new: true,
    is_trending: true,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80"
  },
  {
    name: "Flex Training Elite",
    slug: "flex-training-elite",
    brand: "ShoeShop",
    description: "Versatile training shoe built for gym workouts and cross-training.",
    long_description: "The Flex Training Elite is designed for athletes who demand versatility. A wide, flat outsole provides a stable base for lifting, while the flexible forefoot allows for natural movement during agility drills and cardio.",
    price: 149.00,
    rating: 4.7,
    review_count: 567,
    is_featured: true,
    image: "https://images.unsplash.com/photo-1512374382149-4332c6c021c5?w=800&q=80"
  },
  {
    name: "Luxe Leather Boot",
    slug: "luxe-leather-boot",
    brand: "ShoeShop",
    description: "Handcrafted premium leather boot with Goodyear welt construction.",
    long_description: "Each pair of Luxe Leather Boots is handcrafted by skilled artisans using time-honored techniques. The premium Italian leather upper is paired with a durable Vibram outsole, making these boots as tough as they are elegant.",
    price: 349.00,
    rating: 4.9,
    review_count: 89,
    is_trending: true,
    image: "https://images.unsplash.com/photo-1520639889410-1eb419ef596a?w=800&q=80"
  },
  {
    name: "Cloud Walker",
    slug: "cloud-walker",
    brand: "ShoeShop",
    description: "Ultra-lightweight slip-on with cloud-like cushioning for all-day wear.",
    long_description: "Step into pure comfort with the Cloud Walker. Our lightest shoe ever, featuring a breathable knit upper that fits like a sock and a revolutionary foam outsole that makes you feel like you're walking on air.",
    price: 99.00,
    original_price: 119.00,
    rating: 4.5,
    review_count: 1203,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80"
  },
  {
    name: "Pro Court Ace",
    slug: "pro-court-ace",
    brand: "ShoeShop",
    description: "Court-ready performance with ankle support and responsive cushioning.",
    long_description: "Dominate the court with the Pro Court Ace. High-top design provides superior ankle support for lateral movements, while the ZoomAir unit in the heel delivers explosive energy return on every jump.",
    price: 179.00,
    rating: 4.7,
    review_count: 234,
    is_new: true,
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&q=80"
  },
  {
    name: "Retro Runner '90",
    slug: "retro-runner-90",
    brand: "ShoeShop",
    description: "90s-inspired runner with vintage aesthetics and modern comfort.",
    long_description: "A love letter to the golden era of running shoes. The Retro Runner '90 features authentic vintage materials and colorways combined with modern EVA midsole technology for a ride that's classic yet comfortable.",
    price: 139.00,
    rating: 4.4,
    review_count: 445,
    is_featured: true,
    is_trending: true,
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80"
  },
];

export async function seedProducts(clearExisting: boolean = false) {
  console.log("Starting seeding...");

  if (clearExisting) {
    console.log("Clearing existing data...");
    // Order matters because of foreign keys
    await supabase.from("product_variants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("product_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }

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
  if (!categories) {
    console.error("Failed to fetch categories");
    return;
  }

  const runningCat = categories.find(c => c.slug === "running")?.id;
  const casualCat = categories.find(c => c.slug === "casual")?.id;
  const trainingCat = categories.find(c => c.slug === "training")?.id;
  const lifestyleCat = categories.find(c => c.slug === "lifestyle")?.id;

  for (const product of realProducts) {
    let catId = casualCat;
    if (product.name.includes("Runner") || product.name.includes("Velocity")) catId = runningCat;
    if (product.name.includes("Training")) catId = trainingCat;
    if (product.name.includes("Urban") || product.name.includes("Retro")) catId = lifestyleCat;

    const { image, ...productData } = product;

    const { data: p, error } = await supabase.from("products").upsert({
      ...productData,
      category_id: catId
    }, { onConflict: 'slug' }).select().single();

    if (error) {
      console.error(`Error seeding product ${product.name}:`, error);
      continue;
    }

    if (p) {
      // Add a high-quality image
      await supabase.from("product_images").upsert({
        product_id: p.id,
        image_url: image,
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
