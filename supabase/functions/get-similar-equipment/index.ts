import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface GetSimilarEquipmentParams {
  sourceId: string;
  equipmentId: string;
  limit?: number;
}

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const params: GetSimilarEquipmentParams = await req.json();
    
    // Validate required parameters
    if (!params.sourceId || !params.equipmentId) {
      return new Response(
        JSON.stringify({ error: 'Source ID and equipment ID are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Get equipment details first to find similar items
    let equipmentDetails;
    
    try {
      // Call the get-equipment-details function
      const { data, error } = await supabaseClient.functions.invoke('get-equipment-details', {
        body: {
          sourceId: params.sourceId,
          equipmentId: params.equipmentId
        }
      });
      
      if (error) throw error;
      equipmentDetails = data;
    } catch (error) {
      console.error('Error getting equipment details:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get equipment details' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Now search for similar equipment based on make, model, or category
    const limit = params.limit || 5;
    
    try {
      // Call the search-equipment-sources function
      const { data, error } = await supabaseClient.functions.invoke('search-equipment-sources', {
        body: {
          make: equipmentDetails.make,
          model: equipmentDetails.model,
          category: equipmentDetails.category
        }
      });
      
      if (error) throw error;
      
      // Filter out the original equipment and limit results
      const similarEquipment = data
        .filter((item: any) => item.id !== params.equipmentId)
        .slice(0, limit);
      
      return new Response(
        JSON.stringify(similarEquipment),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error searching for similar equipment:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to find similar equipment' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});