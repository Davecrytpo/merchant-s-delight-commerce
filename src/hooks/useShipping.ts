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
  country_code: string;
  created_at: string;
}

export const useShippingMethods = (countryCode: string = 'US') => {
  return useQuery({
    queryKey: ["shipping-methods", countryCode],
    queryFn: async () => {
      let query = supabase
        .from("shipping_methods")
        .select("*")
        .eq("is_active", true);

      if (countryCode === 'US') {
        // For US, show US-specific and 'ALL' (international)
        query = query.in("country_code", ['US', 'ALL']);
      } else {
        // For others, only show 'ALL' or specific country if implemented
        query = query.eq("country_code", 'ALL');
      }

      const { data, error } = await query.order("price", { ascending: true });
      
      if (error) throw error;
      return data as unknown as ShippingMethod[];
    },
  });
};
