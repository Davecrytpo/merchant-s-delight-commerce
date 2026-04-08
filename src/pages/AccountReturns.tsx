import { Link } from "react-router-dom";
import { RotateCcw, ArrowLeft, Package } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useReturns } from "@/hooks/useReturns";

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-blue-500/10 text-blue-400";
    case "shipped":
      return "bg-purple-500/10 text-purple-400";
    case "completed":
      return "bg-green-500/10 text-green-400";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    case "pending":
    default:
      return "bg-yellow-500/10 text-yellow-400";
  }
};

export default function AccountReturns() {
  const { user, loading } = useAuth();
  const { data: returns, isLoading } = useReturns(user?.id);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
          <RotateCcw className="w-6 h-6 text-background" />
        </div>
        <h1 className="font-display text-2xl font-bold">My Returns</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Please sign in to view your return requests.
        </p>
        <Link to="/account" className="inline-flex items-center gap-2 mt-6 gold-gradient text-background px-6 py-3 rounded-xl font-bold">
          Go to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link to="/account" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-3 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Account
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold">My Returns</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Track return requests and view their latest status.
          </p>
        </div>
        <Link to="/returns" className="inline-flex items-center gap-2 gold-gradient text-background px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Start a Return <RotateCcw className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !returns?.length ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No return requests found.</p>
          <p className="text-xs mt-2">Start a return to see it listed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((r: any) => (
            <div key={r.id} className="glass rounded-2xl p-5 md:p-6 border border-white/5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm">{r.return_request_id}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Order #{r.order_number} - {format(new Date(r.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resolution</p>
                  <p className="font-semibold capitalize">{r.resolution}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason</p>
                  <p className="capitalize">{r.reason?.replace(/_/g, " ") || "Unknown"}</p>
                </div>
                {r.reason_detail && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Details</p>
                    <p>{r.reason_detail}</p>
                  </div>
                )}
              </div>

              {r.admin_notes && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-xs text-muted-foreground italic border-l-2 border-primary">
                  <span className="font-bold not-italic text-primary">Admin Note:</span> {r.admin_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
