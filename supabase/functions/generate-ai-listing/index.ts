import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';
import { corsHeaders } from '../_shared/cors.ts';

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

interface GenerateListingRequest {
  equipmentType: string;
  make?: string;
  model?: string;
  year?: string;
  condition?: string;
  additionalInfo?: string;
  imageUrls?: string[];
  marketplaceData?: any[];
}

interface GenerateListingResponse {
  title: string;
  description: string;
  specifications: Record<string, string>;
  suggestedPrice: number;
  priceRange: [number, number];
  condition: string;
  features: string[];
  marketComparison?: string;
  imagePrompts?: string[];
}

// Function to search for equipment data from marketplace sources
async function searchEquipmentData(params: GenerateListingRequest) {
  try {
    // Call the search-equipment-sources function
    const { data, error } = await supabaseClient.functions.invoke('search-equipment-sources', {
      body: {
        query: `${params.make || ''} ${params.model || ''} ${params.equipmentType || ''}`.trim(),
        make: params.make,
        model: params.model,
        year: params.year,
        category: params.equipmentType
      }
    });

    if (error) {
      console.error('Error searching equipment data:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching equipment data:', error);
    return [];
  }
}

// Function to generate listing using OpenAI
async function generateListing(params: GenerateListingRequest, marketplaceData: any[]): Promise<GenerateListingResponse> {
  try {
    // Prepare the prompt with marketplace data
    let marketplaceDataText = '';
    if (marketplaceData && marketplaceData.length > 0) {
      marketplaceDataText = 'MARKETPLACE DATA:\n';
      marketplaceData.forEach((item, index) => {
        marketplaceDataText += `Item ${index + 1}:\n`;
        marketplaceDataText += `- Title: ${item.title}\n`;
        marketplaceDataText += `- Description: ${item.description}\n`;
        marketplaceDataText += `- Price: ${item.price} ${item.currency}\n`;
        marketplaceDataText += `- Year: ${item.year}\n`;
        marketplaceDataText += `- Make: ${item.make}\n`;
        marketplaceDataText += `- Model: ${item.model}\n`;
        marketplaceDataText += `- Condition: ${item.condition}\n`;
        marketplaceDataText += `- Specifications:\n`;
        
        if (item.specifications) {
          Object.entries(item.specifications).forEach(([key, value]) => {
            marketplaceDataText += `  * ${key}: ${value}\n`;
          });
        }
        
        marketplaceDataText += '\n';
      });
    }

    // Create the prompt
    const prompt = `
Generate a detailed, professional equipment listing for the following equipment:

EQUIPMENT DETAILS:
- Type: ${params.equipmentType || 'Unknown'}
- Make: ${params.make || 'Unknown'}
- Model: ${params.model || 'Unknown'}
- Year: ${params.year || 'Unknown'}
- Condition: ${params.condition || 'Unknown'}
- Additional Information: ${params.additionalInfo || 'None provided'}

${marketplaceDataText}

Based on the above information, create a comprehensive equipment listing with the following components:
1. A clear, descriptive title
2. A detailed description highlighting key features, condition, and selling points
3. Technical specifications in key-value format
4. A suggested price based on market data (if available) or estimated value
5. A price range showing minimum and maximum reasonable prices
6. A condition assessment (Excellent, Good, Fair, Poor)
7. A bullet list of key features and selling points
8. A brief market comparison if marketplace data is available

The listing should be professional, accurate, and appealing to potential buyers in the heavy equipment industry.
`;

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert in heavy equipment sales and marketing. Your task is to create detailed, accurate, and compelling equipment listings based on provided information and market data." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    // Parse the response
    const content = response.data.choices[0].message?.content || '';
    
    // Extract the listing components
    const titleMatch = content.match(/Title:(.+?)(?=Description:|$)/s);
    const descriptionMatch = content.match(/Description:(.+?)(?=Specifications:|$)/s);
    const specificationsMatch = content.match(/Specifications:(.+?)(?=Suggested Price:|$)/s);
    const suggestedPriceMatch = content.match(/Suggested Price:(.+?)(?=Price Range:|$)/s);
    const priceRangeMatch = content.match(/Price Range:(.+?)(?=Condition:|$)/s);
    const conditionMatch = content.match(/Condition:(.+?)(?=Key Features:|$)/s);
    const featuresMatch = content.match(/Key Features:(.+?)(?=Market Comparison:|$)/s);
    const marketComparisonMatch = content.match(/Market Comparison:(.+?)(?=$)/s);

    // Parse specifications
    const specifications: Record<string, string> = {};
    if (specificationsMatch && specificationsMatch[1]) {
      const specLines = specificationsMatch[1].trim().split('\n');
      specLines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim().replace(/^[-*•]/, '').trim();
          const value = parts.slice(1).join(':').trim();
          if (key && value) {
            specifications[key] = value;
          }
        }
      });
    }

    // Parse price range
    let priceRange: [number, number] = [0, 0];
    if (priceRangeMatch && priceRangeMatch[1]) {
      const rangeText = priceRangeMatch[1].trim();
      const rangeMatch = rangeText.match(/\$?([0-9,.]+)\s*-\s*\$?([0-9,.]+)/);
      if (rangeMatch) {
        const min = parseFloat(rangeMatch[1].replace(/,/g, ''));
        const max = parseFloat(rangeMatch[2].replace(/,/g, ''));
        priceRange = [min, max];
      }
    }

    // Parse suggested price
    let suggestedPrice = 0;
    if (suggestedPriceMatch && suggestedPriceMatch[1]) {
      const priceText = suggestedPriceMatch[1].trim();
      const priceMatch = priceText.match(/\$?([0-9,.]+)/);
      if (priceMatch) {
        suggestedPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
      }
    }

    // Parse features
    const features: string[] = [];
    if (featuresMatch && featuresMatch[1]) {
      const featureLines = featuresMatch[1].trim().split('\n');
      featureLines.forEach(line => {
        const feature = line.trim().replace(/^[-*•]/, '').trim();
        if (feature) {
          features.push(feature);
        }
      });
    }

    // Generate image prompts if no images were provided
    const imagePrompts: string[] = [];
    if (!params.imageUrls || params.imageUrls.length === 0) {
      // Generate 3 different image prompts
      imagePrompts.push(
        `Professional photograph of a ${params.year || ''} ${params.make || ''} ${params.model || ''} ${params.equipmentType || ''} from the front angle, showing the entire machine, outdoors with natural lighting.`,
        `Close-up detailed view of the ${params.make || ''} ${params.model || ''} ${params.equipmentType || ''} operator cabin and controls, showing the condition and features.`,
        `Side view of the ${params.year || ''} ${params.make || ''} ${params.model || ''} ${params.equipmentType || ''} showing the full profile, with good lighting to highlight the equipment condition.`
      );
    }

    return {
      title: titleMatch ? titleMatch[1].trim() : `${params.year || ''} ${params.make || ''} ${params.model || ''} ${params.equipmentType || ''}`.trim(),
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      specifications,
      suggestedPrice,
      priceRange,
      condition: conditionMatch ? conditionMatch[1].trim() : params.condition || 'Unknown',
      features,
      marketComparison: marketComparisonMatch ? marketComparisonMatch[1].trim() : undefined,
      imagePrompts: imagePrompts.length > 0 ? imagePrompts : undefined
    };
  } catch (error) {
    console.error('Error generating listing:', error);
    throw new Error('Failed to generate listing');
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const params: GenerateListingRequest = await req.json();
    
    // Validate required parameters
    if (!params.equipmentType) {
      return new Response(
        JSON.stringify({ error: 'Equipment type is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Search for equipment data from marketplace sources
    let marketplaceData = params.marketplaceData || [];
    
    // If marketplace data wasn't provided, search for it
    if (!marketplaceData.length && (params.make || params.model || params.equipmentType)) {
      marketplaceData = await searchEquipmentData(params);
    }

    // Generate the listing
    const listing = await generateListing(params, marketplaceData);
    
    // Return the generated listing
    return new Response(
      JSON.stringify(listing),
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