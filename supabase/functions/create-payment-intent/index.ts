// create-payment-intent/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe?target=deno&no-check";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize Stripe with the secret key
const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_KEY") ?? ""
);

serve(async (_req) => {
  try {
    // Parse the request body
    const { amount, currency, equipment_id } = await _req.json();
    
    // Validate input
    if (!amount || !currency || !equipment_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        equipment_id: equipment_id
      }
    });
    
    // Update equipment listing status in Supabase
    const { error: updateError } = await supabase
      .from('equipment_listings')
      .update({ status: 'pending_payment' })
      .eq('id', equipment_id);
    
    if (updateError) {
      console.error('Error updating equipment listing:', updateError);
      // We don't return an error here as the payment intent was created successfully
    }
    
    // Return the client secret
    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});