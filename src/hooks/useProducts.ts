import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULT_US_SIZES = ["6", "7", "8", "9", "10", "11", "12"];
const DEFAULT_COLORWAYS = [
  { color: "Black", color_hex: "#111111" },
  { color: "White", color_hex: "#F5F5F5" },
  { color: "Brown", color_hex: "#6B4F3A" },
  { color: "Navy", color_hex: "#243B6B" },
];

const buildFallbackVariants = (product: any) => {
  const sizeSet =
    product.category?.toLowerCase() === "kids"
      ? ["11C", "12C", "13C", "1Y", "2Y", "3Y", "4Y"]
      : DEFAULT_US_SIZES;

  return sizeSet.flatMap((size, sizeIdx) =>
    DEFAULT_COLORWAYS.slice(0, 3).map((c, colorIdx) => ({
      id: `fallback-${product.id}-${c.color}-${size}`,
      product_id: product.id,
      size,
      color: c.color,
      color_hex: c.color_hex,
      stock: Math.max(5, 30 - sizeIdx - colorIdx * 3),
      price: product.price,
    }))
  );
};

const attachProductRelations = async (products: any[]) => {
  if (!products?.length) return [];

  const productIds = products.map((p) => p.id);
  const categoryIds = Array.from(
    new Set(products.map((p) => p.category_id).filter(Boolean))
  );

  const [imagesRes, variantsRes, categoriesRes] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .in("product_id", productIds)
      .order("position", { ascending: true }),
    supabase.from("product_variants").select("*").in("product_id", productIds),
    categoryIds.length
      ? supabase.from("categories").select("*").in("id", categoryIds as string[])
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (imagesRes.error) throw imagesRes.error;
  if (variantsRes.error) throw variantsRes.error;
  if (categoriesRes.error) throw categoriesRes.error;

  const imagesByProduct = new Map<string, any[]>();
  for (const img of imagesRes.data || []) {
    const list = imagesByProduct.get(img.product_id) || [];
    list.push(img);
    imagesByProduct.set(img.product_id, list);
  }

  const variantsByProduct = new Map<string, any[]>();
  for (const variant of variantsRes.data || []) {
    const list = variantsByProduct.get(variant.product_id) || [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  const categoriesById = new Map<string, any>();
  for (const category of categoriesRes.data || []) {
    categoriesById.set(category.id, category);
  }

  return products.map((product) => {
    const rawImages = imagesByProduct.get(product.id) || [];
    const rawVariants = variantsByProduct.get(product.id) || [];
    const category = product.category_id ? categoriesById.get(product.category_id) || null : null;

    const seenImageUrls = new Set<string>();
    const productImages = rawImages.filter((img: any) => {
      if (!img?.image_url || seenImageUrls.has(img.image_url)) return false;
      seenImageUrls.add(img.image_url);
      return true;
    });

    const seenVariantKeys = new Set<string>();
    let productVariants = rawVariants.filter((variant: any) => {
      const key = `${variant.size}-${variant.color}`.toLowerCase();
      if (seenVariantKeys.has(key)) return false;
      seenVariantKeys.add(key);
      return true;
    });

    if (productVariants.length < 4) {
      productVariants = buildFallbackVariants({
        id: product.id,
        price: product.price,
        category: category?.slug || "",
      });
    }

    return {
      ...product,
      // DB-shaped fields (existing)
      product_images: productImages,
      product_variants: productVariants,
      categories: category,

      // UI-shaped compatibility fields (camelCase + flattened)
      images: productImages.map((img: any) => img.image_url),
      variants: productVariants.map((variant: any) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        colorHex: variant.color_hex,
        stock: variant.stock,
        price: variant.price ?? product.price,
      })),
      category: category?.name || "",
      longDescription: product.long_description,
      originalPrice: product.original_price,
      reviewCount: product.review_count,
      isNew: product.is_new,
      isFeatured: product.is_featured,
      isTrending: product.is_trending,
      tags: [],
    };
  });
};

export const useProducts = (options: { 
  category?: string; 
  featured?: boolean; 
  limit?: number;
  sort?: string;
} = {}) => {
  return useQuery({
    queryKey: ["products", options.category ?? null, options.featured ?? null, options.limit ?? null, options.sort ?? null],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*");

      if (options.category) {
        query = query.eq("category_id", options.category);
      }
      if (options.featured) {
        query = query.eq("is_featured", true);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return attachProductRelations(data || []);
    },
  });
};

export const useProduct = (idOrSlug: string) => {
  return useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: async () => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      let query = supabase
        .from("products")
        .select("*");

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      const withRelations = await attachProductRelations([data]);
      return withRelations[0] || null;
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    },
  });
};

// Admin Mutations
export const useAdminProductMutations = () => {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async ({ product, images, variants }: any) => {
      // 1. Create product
      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      
      if (productError) throw productError;

      // 2. Add images if any
      if (images && images.length > 0) {
        const imageData = images.map((url: string, index: number) => ({
          product_id: newProduct.id,
          image_url: url,
          position: index
        }));
        const { error: imageError } = await supabase.from("product_images").insert(imageData);
        if (imageError) throw imageError;
      }

      // 3. Add variants if any
      if (variants && variants.length > 0) {
        const variantData = variants.map((v: any) => ({
          product_id: newProduct.id,
          ...v
        }));
        const { error: variantError } = await supabase.from("product_variants").insert(variantData);
        if (variantError) throw variantError;
      }

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, product, images, variants }: any) => {
      // 1. Update product basic info
      const { data: updatedProduct, error: productError } = await supabase
        .from("products")
        .update(product)
        .eq("id", id)
        .select()
        .single();
      
      if (productError) throw productError;

      // 2. Update images (simple approach: delete and re-add)
      if (images) {
        await supabase.from("product_images").delete().eq("product_id", id);
        if (images.length > 0) {
          const imageData = images.map((url: string, index: number) => ({
            product_id: id,
            image_url: url,
            position: index
          }));
          const { error: imageError } = await supabase.from("product_images").insert(imageData);
          if (imageError) throw imageError;
        }
      }

      // 3. Update variants (simple approach: delete and re-add)
      if (variants) {
        await supabase.from("product_variants").delete().eq("product_id", id);
        if (variants.length > 0) {
          const variantData = variants.map((v: any) => ({
            product_id: id,
            size: v.size,
            color: v.color,
            color_hex: v.color_hex,
            stock: v.stock,
            price: v.price
          }));
          const { error: variantError } = await supabase.from("product_variants").insert(variantData);
          if (variantError) throw variantError;
        }
      }

      return updatedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
  });

  return { createProduct, updateProduct, deleteProduct };
};
