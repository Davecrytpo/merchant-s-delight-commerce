import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/api/client";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await apiClient.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await apiClient.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      } as any);

      setIsAdmin(!!data);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
};

