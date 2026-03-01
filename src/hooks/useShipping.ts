import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useShippingMethods = () => {
  return useQuery({
    queryKey: ["shipping-methods"],
    queryFn: async () => {
      console.log("useShippingMethods: Fetching...");
      const { data, error } = await supabase
        .from("shipping_methods")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
      
      if (error) {
        console.error("useShippingMethods: Error", error);
        throw error;
      }
      
      console.log("useShippingMethods: Success", data);
      return data;
    },
  });
};
