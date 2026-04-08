import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";

export function useReturns(userId: string | undefined) {
  return useQuery({
    queryKey: ["returns", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await apiClient
        .from("return_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

