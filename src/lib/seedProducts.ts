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
  category_slug:
    | "running"
    | "hiking"
    | "training"
    | "casual"
    | "office"
    | "luxury"
    | "kids"
    | "lifestyle";
  images: string[];
  colorways: Colorway[];
  sizes: string[];
};

const ADULT_SIZES = ["7", "8", "9", "10", "11", "12", "13"];
const OFFICE_SIZES = ["7", "8", "9", "10", "11", "12"];
const KIDS_SIZES = ["11C", "12C", "13C", "1Y", "2Y", "3Y", "4Y"];

const realProducts: SeedProduct[] = [
  {
    name: "Air Velocity Pro",
    slug: "air-velocity-pro",
    brand: "ShoeShop",
    description: "Engineered for speed with responsive cushioning and a breathable upper.",
    long_description:
      "The Air Velocity Pro is built for runners who want speed and comfort in one package. It combines lightweight support with responsive foam for daily training and race day performance.",
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
    colorways: [
      { name: "Jet Black", hex: "#111111" },
      { name: "Crimson Red", hex: "#C51F2A" },
      { name: "Arctic White", hex: "#F5F5F5" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Urban Street Classic",
    slug: "urban-street-classic",
    brand: "ShoeShop",
    description: "Timeless street style with all-day comfort.",
    long_description:
      "Urban Street Classic blends heritage design and modern comfort for everyday wear. Premium materials and durable construction make it a reliable daily staple.",
    price: 129,
    rating: 4.6,
    review_count: 891,
    is_featured: true,
    category_slug: "casual",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&q=80",
    ],
    colorways: [
      { name: "Classic White", hex: "#FFFFFF" },
      { name: "Slate Grey", hex: "#5F6A72" },
      { name: "Coffee Brown", hex: "#6B4423" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Summit Trail X",
    slug: "summit-trail-x",
    brand: "ShoeShop",
    description: "Water-resistant trail shoe built for rugged terrain.",
    long_description:
      "Summit Trail X features aggressive traction, reinforced support, and weather-ready materials. It is made for demanding hikes, rough trails, and all-condition adventures.",
    price: 219,
    original_price: 259,
    rating: 4.9,
    review_count: 156,
    is_new: true,
    is_trending: true,
    category_slug: "hiking",
    images: [
      "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=1200&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=1200&q=80",
    ],
    colorways: [
      { name: "Forest Green", hex: "#1F5D3D" },
      { name: "Sandstone", hex: "#C4A484" },
      { name: "Midnight Navy", hex: "#1F2A44" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Flex Training Elite",
    slug: "flex-training-elite",
    brand: "ShoeShop",
    description: "Versatile training shoe for gym and cross-training.",
    long_description:
      "Flex Training Elite gives you stability for strength work and flexibility for movement drills. It is tuned for mixed workouts and long training sessions.",
    price: 149,
    rating: 4.7,
    review_count: 567,
    is_featured: true,
    category_slug: "training",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&q=80",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1200&q=80",
    ],
    colorways: [
      { name: "Onyx Black", hex: "#101214" },
      { name: "Electric Blue", hex: "#2D6CDF" },
      { name: "Volt Lime", hex: "#B8D430" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Luxe Leather Boot",
    slug: "luxe-leather-boot",
    brand: "ShoeShop",
    description: "Premium handcrafted leather boot with luxury finish.",
    long_description:
      "Luxe Leather Boot is crafted for elevated style with robust build quality. It pairs premium leather with a comfort-focused insole for long wear.",
    price: 349,
    rating: 4.9,
    review_count: 89,
    is_trending: true,
    is_featured: true,
    category_slug: "luxury",
    images: [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80",
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=1200&q=80",
    ],
    colorways: [
      { name: "Dark Brown", hex: "#4E342E" },
      { name: "Black", hex: "#1C1C1C" },
      { name: "Tan", hex: "#B9895B" },
    ],
    sizes: OFFICE_SIZES,
  },
  {
    name: "Cloud Walker",
    slug: "cloud-walker",
    brand: "ShoeShop",
    description: "Ultra-light casual comfort for daily wear.",
    long_description:
      "Cloud Walker is designed for effortless comfort and lightweight flexibility. It delivers soft cushioning and breathable support for everyday movement.",
    price: 99,
    original_price: 119,
    rating: 4.5,
    review_count: 1203,
    category_slug: "casual",
    images: [
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=80",
      "https://images.unsplash.com/photo-1626947346165-4c2288dadc2a?w=1200&q=80",
    ],
    colorways: [
      { name: "Cloud White", hex: "#F3F5F7" },
      { name: "Sky Blue", hex: "#78A7D7" },
      { name: "Rose Pink", hex: "#D4879C" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Pro Court Ace",
    slug: "pro-court-ace",
    brand: "ShoeShop",
    description: "Court-focused performance with ankle support.",
    long_description:
      "Pro Court Ace is made for explosive movement and high-impact play. It provides secure support, responsive cushioning, and dependable traction.",
    price: 179,
    rating: 4.7,
    review_count: 234,
    is_new: true,
    category_slug: "training",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1200&q=80",
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=1200&q=80",
    ],
    colorways: [
      { name: "Court White", hex: "#FAFAFA" },
      { name: "Royal Blue", hex: "#2256A3" },
      { name: "Infrared", hex: "#E83A30" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Retro Runner 90",
    slug: "retro-runner-90",
    brand: "ShoeShop",
    description: "Vintage-inspired runner with modern comfort.",
    long_description:
      "Retro Runner 90 keeps classic style while delivering current-day comfort. It is ideal for lifestyle wear with standout color options.",
    price: 139,
    rating: 4.4,
    review_count: 445,
    is_featured: true,
    is_trending: true,
    category_slug: "lifestyle",
    images: [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1200&q=80",
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&q=80",
    ],
    colorways: [
      { name: "Vintage White", hex: "#F4F0E6" },
      { name: "Navy Blue", hex: "#243B6B" },
      { name: "Burgundy", hex: "#6F1D2A" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Executive Oxford",
    slug: "executive-oxford",
    brand: "ShoeShop",
    description: "Elegant office oxford for business and formal wear.",
    long_description:
      "Executive Oxford brings a refined silhouette and polished finish for boardroom-ready style. It balances luxury look and day-long comfort.",
    price: 289,
    original_price: 329,
    rating: 4.9,
    review_count: 128,
    is_featured: true,
    category_slug: "office",
    images: [
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=1200&q=80",
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1200&q=80",
    ],
    colorways: [
      { name: "Espresso", hex: "#4A3426" },
      { name: "Black", hex: "#111111" },
      { name: "Cognac", hex: "#9C6A3E" },
    ],
    sizes: OFFICE_SIZES,
  },
  {
    name: "Heritage Penny Loafer",
    slug: "heritage-penny-loafer",
    brand: "ShoeShop",
    description: "Sophisticated leather loafer for office and smart-casual outfits.",
    long_description:
      "Heritage Penny Loafer combines timeless style with soft underfoot comfort. It is ideal for office days, dinners, and polished everyday wear.",
    price: 239,
    rating: 4.8,
    review_count: 204,
    category_slug: "office",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80",
      "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=1200&q=80",
    ],
    colorways: [
      { name: "Mahogany", hex: "#5A3428" },
      { name: "Jet Black", hex: "#161616" },
      { name: "Chestnut", hex: "#8A5A3A" },
    ],
    sizes: OFFICE_SIZES,
  },
  {
    name: "Kids Play Sprint",
    slug: "kids-play-sprint",
    brand: "ShoeShop Kids",
    description: "Lightweight kids runner for school and playground.",
    long_description:
      "Kids Play Sprint is built for energetic days with cushioned comfort, breathable materials, and durable grip for active movement.",
    price: 79,
    rating: 4.7,
    review_count: 310,
    is_new: true,
    category_slug: "kids",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200&q=80",
    ],
    colorways: [
      { name: "Ocean Blue", hex: "#2F6CD6" },
      { name: "Lime Pop", hex: "#9ACD32" },
      { name: "Candy Pink", hex: "#E06AA8" },
    ],
    sizes: KIDS_SIZES,
  },
  {
    name: "Kids Campus Classic",
    slug: "kids-campus-classic",
    brand: "ShoeShop Kids",
    description: "Durable everyday kids sneaker with easy comfort fit.",
    long_description:
      "Kids Campus Classic is a versatile daily sneaker designed for comfort, durability, and quick movement from class to playtime.",
    price: 69,
    rating: 4.6,
    review_count: 280,
    category_slug: "kids",
    images: [
      "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=1200&q=80",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=1200&q=80",
    ],
    colorways: [
      { name: "Primary Red", hex: "#D62F2F" },
      { name: "School Navy", hex: "#1F3A6D" },
      { name: "Graphite", hex: "#4F4F4F" },
    ],
    sizes: KIDS_SIZES,
  },
  {
    name: "Alpine Trek Shield",
    slug: "alpine-trek-shield",
    brand: "ShoeShop",
    description: "Technical hiking shoe with premium grip and support.",
    long_description:
      "Alpine Trek Shield delivers trail confidence with high-grip outsole geometry, durable overlays, and comfort-tuned cushioning.",
    price: 249,
    original_price: 289,
    rating: 4.9,
    review_count: 111,
    is_trending: true,
    category_slug: "hiking",
    images: [
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    colorways: [
      { name: "Olive", hex: "#4D5D3A" },
      { name: "Stone", hex: "#8C8A83" },
      { name: "Graphite", hex: "#3A3F44" },
    ],
    sizes: ADULT_SIZES,
  },
  {
    name: "Royale Monk Strap",
    slug: "royale-monk-strap",
    brand: "ShoeShop Signature",
    description: "Luxury double monk strap shoe with premium leather finish.",
    long_description:
      "Royale Monk Strap is tailored for premium formal styling with fine leather construction, elegant profile, and refined comfort for special occasions.",
    price: 399,
    rating: 5.0,
    review_count: 76,
    is_featured: true,
    category_slug: "luxury",
    images: [
      "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    colorways: [
      { name: "Midnight Black", hex: "#0F0F0F" },
      { name: "Royal Brown", hex: "#5E3D2B" },
      { name: "Oxblood", hex: "#5C1F1F" },
    ],
    sizes: OFFICE_SIZES,
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
      description: "Performance running shoes",
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
    },
    {
      name: "Hiking",
      slug: "hiking",
      description: "Outdoor and trail-ready footwear",
      image_url:
        "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1000",
    },
    {
      name: "Training",
      slug: "training",
      description: "Gym and cross-training essentials",
      image_url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1000&q=80",
    },
    {
      name: "Casual",
      slug: "casual",
      description: "Everyday comfort and style",
      image_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1000&q=80",
    },
    {
      name: "Office",
      slug: "office",
      description: "Formal and business-ready shoes",
      image_url:
        "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1000",
    },
    {
      name: "Luxury",
      slug: "luxury",
      description: "High-end premium leather footwear",
      image_url:
        "https://images.pexels.com/photos/267202/pexels-photo-267202.jpeg?auto=compress&cs=tinysrgb&w=1000",
    },
    {
      name: "Kids",
      slug: "kids",
      description: "Durable and comfortable kids footwear",
      image_url:
        "https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1000",
    },
    {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Street-ready fashion sneakers",
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
      const dedupImages = Array.from(new Set(images));
      const { error: imageError } = await supabase.from("product_images").insert(
        dedupImages.map((imageUrl, index) => ({
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
          stock: Math.max(8, 35 - colorIndex * 4 - sizeIndex),
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
