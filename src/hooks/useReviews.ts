import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const useReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, rating, title, comment }: { productId: string; rating: number; title?: string; comment: string }) => {
      if (!user) throw new Error("You must be logged in to leave a review");

      const { data, error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          title: title || null,
          comment,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already reviewed this product");
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      toast.success("Thank you! Your review earned you 50 reward points! 🎉");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit review");
    },
  });
};
