import { useQuery } from "@tanstack/react-query";

export interface USPSTracking {
  status: string;
  details: string;
  estimatedDelivery?: string;
  events: Array<{
    time: string;
    location: string;
    description: string;
  }>;
}

export const useUSPSTracking = (trackingNumber: string | null) => {
  return useQuery({
    queryKey: ["usps-tracking", trackingNumber],
    queryFn: async (): Promise<USPSTracking> => {
      if (!trackingNumber) throw new Error("No tracking number provided");

      // Note: Real integration would call a Supabase Edge Function that proxies to USPS API
      // to keep credentials secure.
      
      // MOCK implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        status: "In Transit",
        details: "Your package is on its way to the destination.",
        estimatedDelivery: "March 15, 2026",
        events: [
          { time: "2026-03-04 10:00 AM", location: "NEW YORK, NY", description: "Arrived at USPS Facility" },
          { time: "2026-03-03 04:00 PM", location: "LOS ANGELES, CA", description: "Departed Post Office" },
          { time: "2026-03-03 09:00 AM", location: "LOS ANGELES, CA", description: "Package Accepted" },
        ]
      };
    },
    enabled: !!trackingNumber && trackingNumber.startsWith("9"), // USPS numbers often start with 9
  });
};
