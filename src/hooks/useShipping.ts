import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShippingMethod {
  id: string;
  carrier: string;
  name: string;
  description: string | null;
  price: number;
  estimated_days: string | null;
  min_order_amount: number | null;
  is_active: boolean;
  created_at: string;
}

export const useShippingMethods = () => {
  return useQuery({
    queryKey: ["shipping-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_methods" as any)
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      
      if (error) throw error;
      return data as unknown as ShippingMethod[];
    },
  });
};
