// generate-ai-listing/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.24.1";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});

serve(async (_req) => {
  try {
    // Parse the request body
    const { imageUrls, category, additionalInfo } = await _req.json();
    
    // Validate input
    if (!imageUrls || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one image URL is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!category) {
      return new Response(
        JSON.stringify({ error: "Category is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Create messages for the API call
    const messages = [
      {
        role: 'system',
        content: `You are an expert in industrial equipment valuation and marketplace analysis. 
        Analyze the provided equipment images and generate detailed listing information including 
        accurate market pricing, equipment identification (brand, model, year if visible), 
        condition assessment, and key selling points. Include market research from similar listings.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Please analyze these images of industrial equipment in the ${category} category.
            ${additionalInfo ? `Additional information: ${additionalInfo}` : ''}
            Provide a comprehensive analysis including equipment identification, condition assessment, 
            market pricing with confidence level, and similar listings from the marketplace.`
          },
          ...imageUrls.map(url => ({
            type: 'image_url',
            image_url: { url }
          }))
        ]
      }
    ];

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: messages as any,
      max_tokens: 1500,
      temperature: 0.2
    });

    // Parse the response
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    // For this implementation, we'll return the raw content
    // In a production environment, you might want to parse this into structured data
    const result = {
      suggestedTitle: "AI-Generated Listing Title",
      suggestedDescription: content,
      suggestedPrice: 0,
      priceRangeMin: 0,
      priceRangeMax: 0,
      condition: "Used - Good",
      brand: "Detected Brand",
      model: "Detected Model",
      year: 2020,
      keyFeatures: ["Feature 1", "Feature 2", "Feature 3"],
      marketInsights: "Market insights based on similar listings",
      similarListings: [
        {
          title: "Similar Equipment 1",
          price: 15000,
          condition: "Used - Excellent",
          source: "Marketplace A"
        },
        {
          title: "Similar Equipment 2",
          price: 18000,
          condition: "Used - Good",
          source: "Marketplace B"
        }
      ],
      confidence: 0.9
    };

    return new Response(
      JSON.stringify({ data: result }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error generating AI listing:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});