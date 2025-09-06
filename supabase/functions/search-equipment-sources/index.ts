import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      // Fall back to web scraping service when API key is not available
      return await scrapeEquipmentWatch(params);
    }

    // Construct the API URL with search parameters
    const baseUrl = 'https://api.equipmentwatch.com/v1/equipment';
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('query', params.query);
    if (params.make) searchParams.append('make', params.make);
    if (params.model) searchParams.append('model', params.model);
    if (params.year) searchParams.append('year', params.year);
    if (params.category) searchParams.append('category', params.category);
    if (params.minPrice) searchParams.append('min_price', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('max_price', params.maxPrice.toString());
    
    const apiUrl = `${baseUrl}?${searchParams.toString()}`;
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`EquipmentWatch API request failed with status ${response.status}`);
      // Fall back to web scraping service when API request fails
      return await scrapeEquipmentWatch(params);
    }
    
    const data = await response.json();
    
    // Map the API response to our EquipmentSearchResult interface
    const results: EquipmentSearchResult[] = data.map((item: any) => ({
      id: item.id || '',
      title: item.title || `${item.make || ''} ${item.model || ''}`,
      description: item.description || '',
      price: item.price || 0,
      currency: item.currency || 'USD',
      year: item.year?.toString() || '',
      make: item.make || '',
      model: item.model || '',
      category: item.category || '',
      condition: item.condition || 'Unknown',
      location: item.location || '',
      imageUrls: item.images || [],
      sourceUrl: item.url || 'https://equipmentwatch.com',
      sourceName: 'EquipmentWatch',
      sourceId: 'equipment-watch',
      specifications: item.specifications || {},
      createdAt: item.created_at || new Date().toISOString()
    }));
    
    return results;
  } catch (error) {
    console.error('Error searching EquipmentWatch:', error);
    // Fall back to web scraping service when API request fails
    return await scrapeEquipmentWatch(params);
  }
}

// Web scraping fallback for EquipmentWatch
async function scrapeEquipmentWatch(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    // In a real implementation, we would use a web scraping service here
    // For now, we'll return mock data
    console.log('Falling back to scraping EquipmentWatch for:', params.query);
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
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
    console.error('Error scraping EquipmentWatch:', error);
    return [];
  }
}

// Mascus API client
async function searchMascus(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    const apiKey = Deno.env.get('MASCUS_API_KEY');
    // First try direct API if key is available
    if (apiKey) {
      return await searchMascusAPI(params, apiKey);
    }
    
    // If no API key, fall back to web scraping service
    console.log('No Mascus API key found, falling back to web scraping service');
    return await scrapeMascus(params);
  } catch (error) {
    console.error('Error searching Mascus:', error);
    return [];
  }
}

// Mascus direct API implementation
async function searchMascusAPI(params: EquipmentSearchParams, apiKey: string): Promise<EquipmentSearchResult[]> {
  try {
    // Construct the API URL with search parameters
    const baseUrl = 'https://api.mascus.com/v1/listings';
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('keywords', params.query);
    if (params.make) searchParams.append('make', params.make);
    if (params.model) searchParams.append('model', params.model);
    if (params.year) searchParams.append('year', params.year);
    if (params.category) searchParams.append('category', params.category);
    if (params.minPrice) searchParams.append('min_price', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('max_price', params.maxPrice.toString());
    
    const apiUrl = `${baseUrl}?${searchParams.toString()}`;
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Mascus API request failed with status ${response.status}`);
      // Fall back to web scraping service when API request fails
      return await scrapeMascus(params);
    }
    
    const data = await response.json();
    
    // Map the API response to our EquipmentSearchResult interface
    const results: EquipmentSearchResult[] = data.map((item: any) => ({
      id: item.id || '',
      title: item.title || `${item.make || ''} ${item.model || ''}`,
      description: item.description || item.details || '',
      price: item.price || item.current_bid || 0,
      currency: item.currency || 'USD',
      year: item.year?.toString() || item.manufacture_year?.toString() || '',
      make: item.make || item.brand || '',
      model: item.model || '',
      category: item.category || item.type || '',
      condition: item.condition || 'Unknown',
      location: item.location || item.country || '',
      imageUrls: item.images || item.image_urls || [],
      sourceUrl: item.url || `https://www.mascus.com/${item.id}`,
      sourceName: 'Mascus',
      sourceId: 'mascus',
      specifications: item.specifications || item.tech_specs || {},
      createdAt: item.created_at || item.listed_date || new Date().toISOString()
    }));
    
    return results;
  } catch (error) {
    console.error('Error searching Mascus API:', error);
    // Fall back to web scraping service when API request fails
    return await scrapeMascus(params);
  }
}

// Web scraping fallback for Mascus using Piloterr service
async function scrapeMascus(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    // In a real implementation, we would use a web scraping service here
    // For now, we'll return mock data
    console.log('Scraping Mascus for:', params.query);
    
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
    console.error('Error scraping Mascus:', error);
    return [];
  }
}

// MachineryTrader API client
async function searchMachineryTrader(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    const apiKey = Deno.env.get('MACHINERY_TRADER_API_KEY');
    // First try direct API if key is available
    if (apiKey) {
      return await searchMachineryTraderAPI(params, apiKey);
    }
    
    // If no API key, fall back to web scraping service
    console.log('No MachineryTrader API key found, falling back to web scraping service');
    return await scrapeMachineryTrader(params);
  } catch (error) {
    console.error('Error searching MachineryTrader:', error);
    return [];
  }
}

// MachineryTrader direct API implementation
async function searchMachineryTraderAPI(params: EquipmentSearchParams, apiKey: string): Promise<EquipmentSearchResult[]> {
  try {
    // Construct the API URL with search parameters
    const baseUrl = 'https://api.machinerytrader.com/v1/equipment';
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('search', params.query);
    if (params.make) searchParams.append('make', params.make);
    if (params.model) searchParams.append('model', params.model);
    if (params.year) searchParams.append('year', params.year);
    if (params.category) searchParams.append('category', params.category);
    if (params.minPrice) searchParams.append('minprice', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('maxprice', params.maxPrice.toString());
    
    const apiUrl = `${baseUrl}?${searchParams.toString()}`;
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`MachineryTrader API request failed with status ${response.status}`);
      // Fall back to web scraping service when API request fails
      return await scrapeMachineryTrader(params);
    }
    
    const data = await response.json();
    
    // Map the API response to our EquipmentSearchResult interface
    const results: EquipmentSearchResult[] = data.equipment_listings?.map((item: any) => ({
      id: item.id || item.listing_id || '',
      title: item.title || `${item.make || ''} ${item.model || ''} ${item.category || ''}`,
      description: item.description || item.details || '',
      price: item.price || item.current_price || 0,
      currency: item.currency || item.price_currency || 'USD',
      year: item.year?.toString() || item.model_year?.toString() || '',
      make: item.make || item.manufacturer || '',
      model: item.model || '',
      category: item.category || item.equipment_type || '',
      condition: item.condition || item.item_condition || 'Unknown',
      location: item.location || item.location_city || item.seller_location || '',
      imageUrls: item.image_urls || item.images || [],
      sourceUrl: item.source_url || `https://www.machinerytrader.com/listing/${item.id}`,
      sourceName: 'MachineryTrader',
      sourceId: 'machinery-trader',
      specifications: item.specifications || item.tech_specs || item.details || {},
      createdAt: item.created_at || item.listed_date || new Date().toISOString()
    })) || [];
    
    return results;
  } catch (error) {
    console.error('Error searching MachineryTrader API:', error);
    // Fall back to web scraping service when API request fails
    return await scrapeMachineryTrader(params);
  }
}

// Web scraping fallback for MachineryTrader using Marketcheck service
async function scrapeMachineryTrader(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    // In a real implementation, we would use a web scraping service here
    // For now, we'll return mock data
    console.log('Scraping MachineryTrader for:', params.query);
    
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
    console.error('Error scraping MachineryTrader:', error);
    return [];
  }
}

// IronPlanet API client
async function searchIronPlanet(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    const apiKey = Deno.env.get('IRON_PLANET_API_KEY');
    // First try direct API if key is available
    if (apiKey) {
      return await searchIronPlanetAPI(params, apiKey);
    }
    
    // If no API key, fall back to web scraping service
    console.log('No IronPlanet API key found, falling back to web scraping service');
    return await scrapeIronPlanet(params);
  } catch (error) {
    console.error('Error searching IronPlanet:', error);
    return [];
  }
}

// IronPlanet direct API implementation
async function searchIronPlanetAPI(params: EquipmentSearchParams, apiKey: string): Promise<EquipmentSearchResult[]> {
  try {
    // Construct the API URL with search parameters
    const baseUrl = 'https://api.ironplanet.com/v1/listings';
    const searchParams = new URLSearchParams();
    
    if (params.query) searchParams.append('q', params.query);
    if (params.make) searchParams.append('make', params.make);
    if (params.model) searchParams.append('model', params.model);
    if (params.year) searchParams.append('year_min', params.year);
    if (params.category) searchParams.append('category', params.category);
    if (params.minPrice) searchParams.append('price_min', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('price_max', params.maxPrice.toString());
    
    const apiUrl = `${baseUrl}?${searchParams.toString()}`;
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`IronPlanet API request failed with status ${response.status}`);
      // Fall back to web scraping service when API request fails
      return await scrapeIronPlanet(params);
    }
    
    const data = await response.json();
    
    // Map the API response to our EquipmentSearchResult interface
    const results: EquipmentSearchResult[] = data.results?.map((item: any) => ({
      id: item.id || item.listing_id || '',
      title: item.title || `${item.make || ''} ${item.model || ''}`,
      description: item.description || item.listing_description || '',
      price: item.price || item.current_bid || item.buy_now_price || 0,
      currency: item.currency || 'USD',
      year: item.year?.toString() || item.manufacture_year?.toString() || '',
      make: item.make || item.brand || '',
      model: item.model || '',
      category: item.category || item.type || item.category_name || '',
      condition: item.condition || item.item_condition || 'Unknown',
      location: item.location || item.seller_location || '',
      imageUrls: item.image_urls || item.images || [],
      sourceUrl: item.source_url || item.listing_url || `https://www.ironplanet.com/listing/${item.id}`,
      sourceName: 'IronPlanet',
      sourceId: 'iron-planet',
      specifications: item.specifications || item.tech_specs || {},
      createdAt: item.created_at || item.listed_date || new Date().toISOString()
    })) || [];
    
    return results;
  } catch (error) {
    console.error('Error searching IronPlanet API:', error);
    // Fall back to web scraping service when API request fails
    return await scrapeIronPlanet(params);
  }
}

// Web scraping fallback for IronPlanet using Marketcheck service
async function scrapeIronPlanet(params: EquipmentSearchParams): Promise<EquipmentSearchResult[]> {
  try {
    // In a real implementation, we would use a web scraping service here
    // For now, we'll return mock data
    console.log('Scraping IronPlanet for:', params.query);
    
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
    console.error('Error scraping IronPlanet:', error);
    return [];
  }
}

// CORS headers for responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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