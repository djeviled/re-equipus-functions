// get-shipping-rates/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_KEY") ?? ""
);

// Mock shipping rates (in a real implementation, you would call the GoShippo API)
const mockShippingRates = [
  {
    object_id: "rate_1",
    carrier_account: "UPS",
    servicelevel_token: "ups_ground",
    servicelevel_name: "UPS Ground",
    rate: 25.99,
    currency: "USD",
    estimated_days: 5
  },
  {
    object_id: "rate_2",
    carrier_account: "FedEx",
    servicelevel_token: "fedex_home_delivery",
    servicelevel_name: "FedEx Home Delivery",
    rate: 29.50,
    currency: "USD",
    estimated_days: 3
  },
  {
    object_id: "rate_3",
    carrier_account: "USPS",
    servicelevel_token: "usps_priority",
    servicelevel_name: "USPS Priority Mail",
    rate: 22.75,
    currency: "USD",
    estimated_days: 2
  }
];

serve(async (_req) => {
  try {
    // Parse the request body
    const { address_from, address_to, parcel } = await _req.json();
    
    // Validate input
    if (!address_from || !address_to || !parcel) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // In a real implementation, you would call the GoShippo API here
    // For this example, we'll return mock shipping rates
    
    // Return the shipping rates
    return new Response(
      JSON.stringify({ rates: mockShippingRates }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});