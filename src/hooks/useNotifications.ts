import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";
import { useEffect } from "react";

export const useAdminNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = apiClient
      .channel("admin-notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        }
      )
      .subscribe();

    return () => { apiClient.removeChannel(channel); };
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await apiClient
        .from("admin_notifications")
        .update({ is_read: true } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await apiClient
        .from("admin_notifications")
        .update({ is_read: true } as any)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const unreadCount = query.data?.filter((n: any) => !n.is_read).length || 0;

  return { ...query, unreadCount, markAsRead, markAllRead };
};

