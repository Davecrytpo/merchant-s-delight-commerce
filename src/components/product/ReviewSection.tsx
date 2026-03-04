import { useState } from "react";
import { useReviews, useSubmitReview } from "@/hooks/useReviews";
import { useAuth } from "@/context/AuthContext";
import { Star, MessageSquare, Loader2, Send, User, Award } from "lucide-react";
import { format } from "date-fns";

export default function ReviewSection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useReviews(productId);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  const avgRating = reviews?.length
    ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await submitReview.mutateAsync({ productId, rating, title, comment });
      setComment("");
      setTitle("");
      setRating(5);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/50">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? "text-primary fill-primary" : "text-muted"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{reviews?.length || 0} reviews</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!showForm && user && (
            <button
              onClick={() => setShowForm(true)}
              className="gold-gradient text-background font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
            >
              Write a Review
            </button>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            <Award className="w-3 h-3 text-primary" />
            <span>Earn <strong className="text-primary">50 pts</strong> per review</span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="glass p-6 md:p-8 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Your Review</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">Cancel</button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rating</p>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onMouseEnter={() => setHovered(i + 1)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(i + 1)} className="p-1 transition-transform hover:scale-125 active:scale-90">
                    <Star className={`w-8 h-8 ${i < (hovered || rating) ? "text-primary fill-primary" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Title (Optional)</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up your experience"
                className="w-full bg-secondary/50 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-border/50"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Comment</p>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike about these shoes?"
                className="w-full bg-secondary/50 rounded-2xl px-5 py-4 min-h-[120px] outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-border/50"
              />
            </div>

            <button type="submit" disabled={submitReview.isPending} className="w-full gold-gradient text-background font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50">
              {submitReview.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submit My Review (+50 pts)
            </button>
          </form>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : !reviews?.length ? (
          <div className="py-12 text-center text-muted-foreground glass rounded-3xl p-8 border-dashed border-2 border-border/50">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience with this product!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {reviews.map((r: any) => (
              <div key={r.id} className="flex gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                  {r.profiles?.avatar_url ? (
                    <img src={r.profiles.avatar_url} alt={r.profiles.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground opacity-50" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-foreground">{r.profiles?.full_name || "Verified Customer"}</p>
                      {r.is_verified_purchase && (
                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">✓ Verified Purchase</span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                      {format(new Date(r.created_at), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-primary fill-primary" : "text-muted"}`} />
                    ))}
                  </div>
                  {r.title && <p className="font-semibold text-foreground">{r.title}</p>}
                  <p className="text-muted-foreground leading-relaxed">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
