import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/integrations/api/client";
import { AlertCircle, Bot, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [storeName, setStoreName] = useState("Merchant's Delight");
  const [currency, setCurrency] = useState("USD");
  const inputClass = "w-full bg-secondary rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary";

  const { data: aiStatus, isLoading: aiLoading } = useQuery({
    queryKey: ["admin-ai-debug-status"],
    queryFn: async () => {
      const { data, error } = await apiClient.functions.invoke("ai-debug-status");
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  const runAiTest = useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.functions.invoke("ai-debug-test");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-debug-status"] });
      toast.success(data?.ok ? `${data?.provider || "AI"} test passed` : `${data?.provider || "AI"} test returned an unexpected reply`);
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-debug-status"] });
      toast.error(error?.message || "AI test failed");
    },
  });

  const recentLogs = aiStatus?.recent_logs || [];
  const lastTestReply = runAiTest.data?.reply;

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl">
      <h1 className="font-display text-xl md:text-2xl font-bold">Settings</h1>

      <div className="glass rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4">
        <h2 className="font-semibold text-sm md:text-base">General</h2>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Store Name</label>
          <input className={inputClass} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Currency</label>
          <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (EUR)</option>
            <option value="GBP">GBP (GBP)</option>
          </select>
        </div>
        <button
          onClick={() => toast.success("Settings saved!")}
          className="gold-gradient text-background font-semibold px-6 py-3 rounded-xl hover:opacity-90 w-full sm:w-auto"
        >
          Save Changes
        </button>
      </div>

      <div className="glass rounded-xl md:rounded-2xl p-4 md:p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm md:text-base">AI Debug</h2>
              <p className="text-xs text-muted-foreground">AI status, live test, and recent assistant logs.</p>
            </div>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-ai-debug-status"] })}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm hover:bg-secondary/80"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {aiLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Provider</p>
                <p className="mt-1 font-semibold capitalize">{aiStatus?.provider || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{aiStatus?.model || "Unknown model"}</p>
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">API Key</p>
                <div className="mt-1 flex items-center gap-2">
                  {aiStatus?.configured ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                  <p className="font-semibold">{aiStatus?.configured ? "Configured" : "Missing"}</p>
                </div>
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Latest Success</p>
                <p className="mt-1 text-sm font-semibold">
                  {aiStatus?.latest_success_at ? formatDistanceToNow(new Date(aiStatus.latest_success_at), { addSuffix: true }) : "No success logged"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {aiStatus?.latest_fallback_at ? `Last fallback ${formatDistanceToNow(new Date(aiStatus.latest_fallback_at), { addSuffix: true })}` : "No fallback logged"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => runAiTest.mutate()}
                disabled={runAiTest.isPending}
                className="gold-gradient text-background font-semibold px-5 py-3 rounded-xl hover:opacity-90 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {runAiTest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                Run Live AI Test
              </button>
              {lastTestReply ? <p className="text-sm text-muted-foreground">Latest test reply: <span className="font-semibold text-foreground">{lastTestReply}</span></p> : null}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Recent AI Logs</h3>
              {!recentLogs.length ? (
                <div className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">No AI debug logs yet.</div>
              ) : (
                recentLogs.map((log: any) => (
                  <div key={log.id} className="rounded-xl bg-secondary p-4 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === "success" ? "bg-green-500/10 text-green-500" :
                          log.status === "fallback" ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-sm font-semibold">{log.source}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                    {log.error ? <p className="text-xs text-destructive break-all">{log.error}</p> : null}
                    <p className="text-xs text-muted-foreground">
                      Model: {log.model || "unknown"} {typeof log.duration_ms === "number" ? `• ${log.duration_ms}ms` : ""}
                    </p>
                    {log.request_excerpt ? <p className="text-xs text-muted-foreground break-words">Prompt: {log.request_excerpt}</p> : null}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
