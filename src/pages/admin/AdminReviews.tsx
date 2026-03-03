import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Check, X, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews", filter],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(`
          *,
          products (name),
          profiles:user_id (full_name)
        `)
        .order("created_at", { ascending: false });

      if (filter === "pending") query = query.eq("is_approved", false);
      if (filter === "approved") query = query.eq("is_approved", true);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateReviewStatus = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string, is_approved: boolean }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Review status updated");
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reviews")
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
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold">Product Reviews</h1>
        <div className="flex bg-secondary rounded-xl p-1">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-background/50 text-muted-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : !reviews?.length ? (
          <div className="p-12 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No reviews found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="py-4 px-6">Product & Customer</th>
                <th className="py-4 px-6">Rating & Comment</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Status</th>
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
                    <p className="text-muted-foreground line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.is_approved ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                      {r.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      {r.is_approved ? (
                        <button 
                          onClick={() => updateReviewStatus.mutate({ id: r.id, is_approved: false })}
                          className="p-2 hover:bg-yellow-500/10 hover:text-yellow-500 rounded-lg transition-colors"
                          title="Set to Pending"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateReviewStatus.mutate({ id: r.id, is_approved: true })}
                          className="p-2 hover:bg-green-500/10 hover:text-green-500 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteReview.mutate(r.id)}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
