import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export const useReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq("product_id", productId)
        .eq("is_approved", true)
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
    mutationFn: async ({ productId, rating, comment }: { productId: string, rating: number, comment: string }) => {
      if (!user) throw new Error("You must be logged in to leave a review");

      // Check if user has purchased the product via RPC
      const { data: hasPurchased, error: purchaseError } = await supabase
        .rpc("has_purchased_product", { 
          user_uuid: user.id, 
          product_uuid: productId 
        });

      if (purchaseError) throw purchaseError;

      // Note: In development, you might want to allow reviews even if not purchased.
      // But Requirement 2 says: "Customers can leave reviews only after purchase"
      if (!hasPurchased) {
        throw new Error("You can only review products you have purchased and received.");
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
          is_approved: true, // Auto-approve for now
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
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      toast.success("Thank you! Your review has been submitted.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit review");
    }
  });
};
