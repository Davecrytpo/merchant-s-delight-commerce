import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminReviews() {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          *,
          products (name),
          profiles:user_id (full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Review deleted");
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Product Reviews</h1>

      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : !reviews?.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No reviews found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-4 px-6">Product & Customer</th>
                <th className="py-4 px-6">Rating & Comment</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r: any) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-foreground">{r.products?.name}</p>
                    <p className="text-xs text-muted-foreground">{r.profiles?.full_name || "Anonymous"}</p>
                  </td>
                  <td className="py-4 px-6 max-w-md">
                    <div className="flex mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-primary fill-primary" : "text-muted"}`} />
                      ))}
                    </div>
                    {r.title && <p className="font-medium text-foreground text-xs mb-1">{r.title}</p>}
                    <p className="text-muted-foreground line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => deleteReview.mutate(r.id)}
                      className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
