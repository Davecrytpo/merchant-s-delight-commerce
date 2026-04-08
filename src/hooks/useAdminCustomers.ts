import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

export const useAdminCustomers = () => {
  const queryClient = useQueryClient();

  const customers = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await apiClient
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updatePoints = useMutation({
    mutationFn: async ({ userId, points }: { userId: string, points: number }) => {
      const { error } = await apiClient
        .from("profiles")
        .update({ reward_points: points })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      toast.success("Customer points updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update points");
    }
  });

  return { customers, updatePoints };
};

