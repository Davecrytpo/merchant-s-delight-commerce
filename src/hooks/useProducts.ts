import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProducts = (options: { 
  category?: string; 
  featured?: boolean; 
  limit?: number;
  sort?: string;
} = {}) => {
  return useQuery({
    queryKey: ["products", options],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_images (*),
          product_variants (*),
          categories (*)
        `);

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
      return data;
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
        .select(`
          *,
          product_images (*),
          product_variants (*),
          categories (*)
        `);

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data, error } = await query.single();
      if (error) throw error;
      return data;
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
