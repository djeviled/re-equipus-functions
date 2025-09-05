import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';
import { corsHeaders } from '../_shared/cors.ts';

interface MarketValueEstimateParams {
  make: string;
  model: string;
  year?: string;
  condition?: string;
}

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Create an OpenAI client
const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});
const openai = new OpenAIApi(configuration);

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const params: MarketValueEstimateParams = await req.json();
    
    // Validate required parameters
    if (!params.make || !params.model) {
      return new Response(
        JSON.stringify({ error: 'Make and model are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // First, try to get market data from equipment sources
    let marketData = [];
    
    try {
      // Call the search-equipment-sources function
      const { data, error } = await supabaseClient.functions.invoke('search-equipment-sources', {
        body: {
          make: params.make,
          model: params.model,
          year: params.year
        }
      });
      
      if (error) throw error;
      marketData = data || [];
    } catch (error) {
      console.error('Error getting market data:', error);
      // Continue with estimation even if market data retrieval fails
    }

    // Calculate market value estimate based on available data
    let estimatedValue = 0;
    let valueRange: [number, number] = [0, 0];
    let confidence = 0;
    
    if (marketData.length > 0) {
      // If we have market data, calculate based on that
      const prices = marketData.map((item: any) => item.price);
      const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      estimatedValue = Math.round(avgPrice);
      valueRange = [Math.round(minPrice * 0.9), Math.round(maxPrice * 1.1)];
      confidence = 0.8; // High confidence with market data
    } else {
      // If no market data, use AI to estimate
      const estimate = await estimateValueWithAI(params);
      estimatedValue = estimate.estimatedValue;
      valueRange = estimate.valueRange;
      confidence = estimate.confidence;
    }
    
    // Return the market value estimate
    return new Response(
      JSON.stringify({
        estimatedValue,
        valueRange,
        confidence
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
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

// Function to estimate value using AI
async function estimateValueWithAI(params: MarketValueEstimateParams): Promise<{
  estimatedValue: number;
  valueRange: [number, number];
  confidence: number;
}> {
  try {
    // Create the prompt
    const prompt = `
I need to estimate the market value of the following equipment:

- Make: ${params.make}
- Model: ${params.model}
${params.year ? `- Year: ${params.year}` : ''}
${params.condition ? `- Condition: ${params.condition}` : ''}

Based on your knowledge of heavy equipment values as of 2025, please provide:
1. An estimated market value in USD
2. A reasonable price range (minimum and maximum values)
3. A confidence level in your estimate (0.0 to 1.0)

Format your response as JSON:
{
  "estimatedValue": number,
  "valueRange": [minValue, maxValue],
  "confidence": number
}
`;

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert in heavy equipment valuation with extensive knowledge of market prices. Provide accurate estimates based on make, model, year, and condition." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    // Parse the response
    const content = response.data.choices[0].message?.content || '';
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);
      
      return {
        estimatedValue: result.estimatedValue,
        valueRange: result.valueRange,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback to default values
      return {
        estimatedValue: 50000, // Generic fallback value
        valueRange: [40000, 60000],
        confidence: 0.4 // Low confidence
      };
    }
  } catch (error) {
    console.error('Error estimating value with AI:', error);
    
    // Fallback to default values
    return {
      estimatedValue: 50000, // Generic fallback value
      valueRange: [40000, 60000],
      confidence: 0.3 // Very low confidence
    };
  }
}