import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface EquipmentSearchParams {
  query: string;
  category?: string;
  make?: string;
  model?: string;
  year?: string;
  minPrice?: number;
  maxPrice?: number;
  source?: string[];
}

interface EquipmentSearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  year: string;
  make: string;
  model: string;
  category: string;
  condition: string;
  location: string;
  imageUrls: string[];
  sourceUrl: string;
  sourceName: string;
  sourceId: string;
  specifications: Record<string, string>;
  createdAt: string;
}

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Equipment Watch API client
async function searchEquipmentWatch(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    const apiKey = Deno.env.get('EQUIPMENT_WATCH_API_KEY');
    if (!apiKey) {
      console.error('EquipmentWatch API key not found');
      return [];
    }

    // In a real implementation, we would make an API request to EquipmentWatch
    // For now, we'll return mock data
    console.log('Searching EquipmentWatch for:', params.query);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return [
      {
        id: 'ew-1',
        title: `${params.make || 'CAT'} ${params.model || '320D L'} Excavator`,
        description: 'Hydraulic excavator in excellent condition with low hours.',
        price: 85000,
        currency: 'USD',
        year: params.year || '2019',
        make: params.make || 'CAT',
        model: params.model || '320D L',
        category: params.category || 'Excavators',
        condition: 'Excellent',
        location: 'Dallas, TX',
        imageUrls: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://equipmentwatch.com',
        sourceName: 'EquipmentWatch',
        sourceId: 'equipment-watch',
        specifications: {
          'Engine': 'Cat C6.6 ACERT',
          'Net Power': '148 hp',
          'Operating Weight': '50,927 lb',
          'Max Digging Depth': '23 ft 6 in',
          'Max Reach': '32 ft 10 in',
          'Bucket Capacity': '1.5 cu yd'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'ew-2',
        title: `${params.make || 'John Deere'} ${params.model || '310SL'} Backhoe Loader`,
        description: 'Versatile backhoe loader with 4x4 capability and extendable dipper.',
        price: 65000,
        currency: 'USD',
        year: params.year || '2020',
        make: params.make || 'John Deere',
        model: params.model || '310SL',
        category: params.category || 'Backhoe Loaders',
        condition: 'Good',
        location: 'Chicago, IL',
        imageUrls: [
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://equipmentwatch.com',
        sourceName: 'EquipmentWatch',
        sourceId: 'equipment-watch',
        specifications: {
          'Engine': 'John Deere PowerTech',
          'Net Power': '110 hp',
          'Operating Weight': '15,700 lb',
          'Dig Depth': '14 ft 11 in',
          'Loader Capacity': '1.3 cu yd',
          'Backhoe Bucket Capacity': '0.3 cu yd'
        },
        createdAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error searching EquipmentWatch:', error);
    return [];
  }
}

// Mascus scraping client
async function searchMascus(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    // In a real implementation, we would use a scraping service or API
    // For now, we'll return mock data
    console.log('Searching Mascus for:', params.query);
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Return mock data
    return [
      {
        id: 'mascus-1',
        title: `${params.make || 'Volvo'} ${params.model || 'EC220DL'} Excavator`,
        description: 'Well-maintained crawler excavator with low hours and recent service.',
        price: 92000,
        currency: 'USD',
        year: params.year || '2018',
        make: params.make || 'Volvo',
        model: params.model || 'EC220DL',
        category: params.category || 'Excavators',
        condition: 'Good',
        location: 'Atlanta, GA',
        imageUrls: [
          'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://www.mascus.com',
        sourceName: 'Mascus',
        sourceId: 'mascus',
        specifications: {
          'Engine': 'Volvo D6',
          'Net Power': '172 hp',
          'Operating Weight': '22,100 kg',
          'Max Digging Depth': '6,730 mm',
          'Max Reach': '9,900 mm',
          'Bucket Capacity': '1.2 m³'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'mascus-2',
        title: `${params.make || 'Komatsu'} ${params.model || 'PC200'} Hydraulic Excavator`,
        description: 'Reliable hydraulic excavator with good undercarriage and hydraulics.',
        price: 78000,
        currency: 'USD',
        year: params.year || '2017',
        make: params.make || 'Komatsu',
        model: params.model || 'PC200',
        category: params.category || 'Excavators',
        condition: 'Fair',
        location: 'Miami, FL',
        imageUrls: [
          'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://www.mascus.com',
        sourceName: 'Mascus',
        sourceId: 'mascus',
        specifications: {
          'Engine': 'Komatsu SAA6D107E-1',
          'Net Power': '155 hp',
          'Operating Weight': '20,500 kg',
          'Max Digging Depth': '6,620 mm',
          'Max Reach': '9,875 mm',
          'Bucket Capacity': '1.1 m³'
        },
        createdAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error searching Mascus:', error);
    return [];
  }
}

// MachineryTrader scraping client
async function searchMachineryTrader(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    // In a real implementation, we would use a scraping service or API
    // For now, we'll return mock data
    console.log('Searching MachineryTrader for:', params.query);
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return mock data
    return [
      {
        id: 'mt-1',
        title: `${params.make || 'Bobcat'} ${params.model || 'S650'} Skid Steer Loader`,
        description: 'Compact skid steer loader with enclosed cab, AC, and auxiliary hydraulics.',
        price: 35000,
        currency: 'USD',
        year: params.year || '2019',
        make: params.make || 'Bobcat',
        model: params.model || 'S650',
        category: params.category || 'Skid Steers',
        condition: 'Excellent',
        location: 'Denver, CO',
        imageUrls: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://www.machinerytrader.com',
        sourceName: 'MachineryTrader',
        sourceId: 'machinery-trader',
        specifications: {
          'Engine': 'Bobcat Diesel',
          'Net Power': '74 hp',
          'Operating Weight': '8,327 lb',
          'Rated Operating Capacity': '2,690 lb',
          'Tipping Load': '5,380 lb',
          'Height to Hinge Pin': '10 ft 6 in'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'mt-2',
        title: `${params.make || 'JCB'} ${params.model || '3CX'} Backhoe Loader`,
        description: 'Versatile backhoe loader with 4x4, extendable dipper, and multiple attachments.',
        price: 58000,
        currency: 'USD',
        year: params.year || '2020',
        make: params.make || 'JCB',
        model: params.model || '3CX',
        category: params.category || 'Backhoe Loaders',
        condition: 'Good',
        location: 'Phoenix, AZ',
        imageUrls: [
          'https://images.unsplash.com/photo-1566224425427-998503a013f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://www.machinerytrader.com',
        sourceName: 'MachineryTrader',
        sourceId: 'machinery-trader',
        specifications: {
          'Engine': 'JCB EcoMAX',
          'Net Power': '109 hp',
          'Operating Weight': '17,196 lb',
          'Max Dig Depth': '14 ft 7 in',
          'Loader Bucket Capacity': '1.4 cu yd',
          'Backhoe Bucket Width': '24 in'
        },
        createdAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error searching MachineryTrader:', error);
    return [];
  }
}

// IronPlanet scraping client
async function searchIronPlanet(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    // In a real implementation, we would use a scraping service or API
    // For now, we'll return mock data
    console.log('Searching IronPlanet for:', params.query);
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 550));
    
    // Return mock data
    return [
      {
        id: 'ip-1',
        title: `${params.make || 'Caterpillar'} ${params.model || 'D6T'} Dozer`,
        description: 'Low hour dozer with VPAT blade, rear ripper, and enclosed cab with AC.',
        price: 145000,
        currency: 'USD',
        year: params.year || '2018',
        make: params.make || 'Caterpillar',
        model: params.model || 'D6T',
        category: params.category || 'Dozers',
        condition: 'Excellent',
        location: 'Houston, TX',
        imageUrls: [
          'https://images.unsplash.com/photo-1579412690850-bd41cd0af56c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://www.ironplanet.com',
        sourceName: 'IronPlanet',
        sourceId: 'iron-planet',
        specifications: {
          'Engine': 'Cat C9.3 ACERT',
          'Net Power': '215 hp',
          'Operating Weight': '45,000 lb',
          'Blade Capacity': '5.7 cu yd',
          'Undercarriage': '90% remaining',
          'Ripper Type': '3-shank parallelogram'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: 'ip-2',
        title: `${params.make || 'Komatsu'} ${params.model || 'WA380'} Wheel Loader`,
        description: 'Front end loader with GP bucket, good tires, and well-maintained.',
        price: 88000,
        currency: 'USD',
        year: params.year || '2019',
        make: params.make || 'Komatsu',
        model: params.model || 'WA380',
        category: params.category || 'Wheel Loaders',
        condition: 'Good',
        location: 'Seattle, WA',
        imageUrls: [
          'https://images.unsplash.com/photo-1506843223631-b1b5d7c36d5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ],
        sourceUrl: 'https://www.ironplanet.com',
        sourceName: 'IronPlanet',
        sourceId: 'iron-planet',
        specifications: {
          'Engine': 'Komatsu SAA6D107E-3',
          'Net Power': '191 hp',
          'Operating Weight': '39,900 lb',
          'Bucket Capacity': '4.3 cu yd',
          'Breakout Force': '35,270 lb',
          'Tires': '23.5R25, 70% remaining'
        },
        createdAt: new Date().toISOString()
      }
    ];
  } catch (error) {
    console.error('Error searching IronPlanet:', error);
    return [];
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
    const params: EquipmentSearchParams = await req.json();
    
    // Validate required parameters
    if (!params.query && !params.make && !params.model && !params.category) {
      return new Response(
        JSON.stringify({ error: 'At least one search parameter is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Determine which sources to search
    const sourcesToSearch = params.source || ['equipment-watch', 'mascus', 'machinery-trader', 'iron-planet'];
    
    // Search all requested sources in parallel
    const searchPromises: Promise<EquipmentSearchResult[]>[] = [];
    
    if (sourcesToSearch.includes('equipment-watch')) {
      searchPromises.push(searchEquipmentWatch(params));
    }
    
    if (sourcesToSearch.includes('mascus')) {
      searchPromises.push(searchMascus(params));
    }
    
    if (sourcesToSearch.includes('machinery-trader')) {
      searchPromises.push(searchMachineryTrader(params));
    }
    
    if (sourcesToSearch.includes('iron-planet')) {
      searchPromises.push(searchIronPlanet(params));
    }
    
    // Wait for all searches to complete
    const results = await Promise.all(searchPromises);
    
    // Combine and filter results
    let combinedResults = results.flat();
    
    // Apply price filters if provided
    if (params.minPrice !== undefined) {
      combinedResults = combinedResults.filter(item => item.price >= params.minPrice!);
    }
    
    if (params.maxPrice !== undefined) {
      combinedResults = combinedResults.filter(item => item.price <= params.maxPrice!);
    }
    
    // Apply year filter if provided
    if (params.year !== undefined) {
      combinedResults = combinedResults.filter(item => item.year === params.year);
    }
    
    // Sort by relevance (for now, just sort by price)
    combinedResults.sort((a, b) => a.price - b.price);
    
    // Return the results
    return new Response(
      JSON.stringify(combinedResults),
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