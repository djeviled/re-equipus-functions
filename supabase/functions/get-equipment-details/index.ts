import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

interface GetEquipmentDetailsParams {
  sourceId: string;
  equipmentId: string;
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
    const params: GetEquipmentDetailsParams = await req.json();
    
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

    // Call the appropriate function based on the source ID
    let equipmentDetails;
    
    switch (params.sourceId) {
      case 'equipment-watch':
        equipmentDetails = await getEquipmentWatchDetails(params.equipmentId);
        break;
      case 'mascus':
        equipmentDetails = await getMascusDetails(params.equipmentId);
        break;
      case 'machinery-trader':
        equipmentDetails = await getMachineryTraderDetails(params.equipmentId);
        break;
      case 'iron-planet':
        equipmentDetails = await getIronPlanetDetails(params.equipmentId);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid source ID' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        );
    }
    
    // Return the equipment details
    return new Response(
      JSON.stringify(equipmentDetails),
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

// Function to get equipment details from EquipmentWatch
async function getEquipmentWatchDetails(equipmentId: string) {
  // In a real implementation, we would make an API request to EquipmentWatch
  // For now, we'll return mock data
  console.log('Getting EquipmentWatch details for:', equipmentId);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  if (equipmentId === 'ew-1') {
    return {
      id: 'ew-1',
      title: 'CAT 320D L Excavator',
      description: 'Hydraulic excavator in excellent condition with low hours. This machine features a powerful Cat C6.6 ACERT engine, spacious cab with air conditioning, and well-maintained hydraulic system. Recently serviced with new filters and fluids.',
      price: 85000,
      currency: 'USD',
      year: '2019',
      make: 'CAT',
      model: '320D L',
      category: 'Excavators',
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
        'Bucket Capacity': '1.5 cu yd',
        'Fuel Capacity': '108 gal',
        'Hydraulic System': 'Closed-center load sensing',
        'Hydraulic Flow': '49 gal/min',
        'Hydraulic Pressure': '5,076 psi',
        'Track Width': '31.5 in',
        'Ground Clearance': '18 in',
        'Transport Length': '30 ft 4 in',
        'Transport Height': '10 ft 6 in',
        'Transport Width': '10 ft 6 in'
      },
      createdAt: new Date().toISOString()
    };
  } else if (equipmentId === 'ew-2') {
    return {
      id: 'ew-2',
      title: 'John Deere 310SL Backhoe Loader',
      description: 'Versatile backhoe loader with 4x4 capability and extendable dipper. Features include a comfortable cab with AC, pilot controls, and auxiliary hydraulics. This machine is ideal for construction, utility work, and landscaping projects.',
      price: 65000,
      currency: 'USD',
      year: '2020',
      make: 'John Deere',
      model: '310SL',
      category: 'Backhoe Loaders',
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
        'Backhoe Bucket Capacity': '0.3 cu yd',
        'Fuel Capacity': '44 gal',
        'Hydraulic System': 'Pressure-compensated load sensing',
        'Hydraulic Flow': '43 gal/min',
        'Hydraulic Pressure': '3,625 psi',
        'Transmission': 'PowerShift',
        'Forward Speeds': '5',
        'Reverse Speeds': '3',
        'Max Travel Speed': '25 mph',
        'Tire Size Front': '12.5/80-18',
        'Tire Size Rear': '19.5L-24'
      },
      createdAt: new Date().toISOString()
    };
  } else {
    throw new Error('Equipment not found');
  }
}

// Function to get equipment details from Mascus
async function getMascusDetails(equipmentId: string) {
  // In a real implementation, we would use a scraping service or API
  // For now, we'll return mock data
  console.log('Getting Mascus details for:', equipmentId);
  
  // Simulate scraping delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Return mock data
  if (equipmentId === 'mascus-1') {
    return {
      id: 'mascus-1',
      title: 'Volvo EC220DL Excavator',
      description: 'Well-maintained crawler excavator with low hours and recent service. Features include a spacious cab with AC, auxiliary hydraulics, and a quick coupler. The machine has been regularly serviced and is ready to work.',
      price: 92000,
      currency: 'USD',
      year: '2018',
      make: 'Volvo',
      model: 'EC220DL',
      category: 'Excavators',
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
        'Bucket Capacity': '1.2 m³',
        'Hours': '4,500 hrs',
        'Undercarriage': '70% remaining',
        'Hydraulic System': 'Volvo hydraulic system',
        'Auxiliary Hydraulics': 'Yes',
        'Quick Coupler': 'Yes',
        'Cab': 'ROPS/FOPS with AC',
        'Track Width': '600 mm',
        'Transport Length': '9,680 mm',
        'Transport Width': '2,990 mm',
        'Transport Height': '3,030 mm'
      },
      createdAt: new Date().toISOString()
    };
  } else if (equipmentId === 'mascus-2') {
    return {
      id: 'mascus-2',
      title: 'Komatsu PC200 Hydraulic Excavator',
      description: 'Reliable hydraulic excavator with good undercarriage and hydraulics. This machine has been well-maintained and includes a hydraulic quick coupler, auxiliary hydraulics, and a comfortable cab with AC.',
      price: 78000,
      currency: 'USD',
      year: '2017',
      make: 'Komatsu',
      model: 'PC200',
      category: 'Excavators',
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
        'Bucket Capacity': '1.1 m³',
        'Hours': '6,200 hrs',
        'Undercarriage': '60% remaining',
        'Hydraulic System': 'Komatsu HydrauMind',
        'Auxiliary Hydraulics': 'Yes',
        'Quick Coupler': 'Yes',
        'Cab': 'ROPS with AC',
        'Track Width': '600 mm',
        'Transport Length': '9,425 mm',
        'Transport Width': '2,980 mm',
        'Transport Height': '3,040 mm'
      },
      createdAt: new Date().toISOString()
    };
  } else {
    throw new Error('Equipment not found');
  }
}

// Function to get equipment details from MachineryTrader
async function getMachineryTraderDetails(equipmentId: string) {
  // In a real implementation, we would use a scraping service or API
  // For now, we'll return mock data
  console.log('Getting MachineryTrader details for:', equipmentId);
  
  // Simulate scraping delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return mock data
  if (equipmentId === 'mt-1') {
    return {
      id: 'mt-1',
      title: 'Bobcat S650 Skid Steer Loader',
      description: 'Compact skid steer loader with enclosed cab, AC, and auxiliary hydraulics. This machine is in excellent condition with low hours and includes a general purpose bucket. Perfect for construction, landscaping, and agricultural applications.',
      price: 35000,
      currency: 'USD',
      year: '2019',
      make: 'Bobcat',
      model: 'S650',
      category: 'Skid Steers',
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
        'Height to Hinge Pin': '10 ft 6 in',
        'Hours': '1,200 hrs',
        'Hydraulic Flow': '23 gal/min',
        'Auxiliary Hydraulics': 'High Flow',
        'Cab': 'Enclosed with AC and Heat',
        'Controls': 'Selectable (SJC)',
        'Lift Path': 'Vertical',
        'Tires': '12-16.5 NHS',
        'Attachments Included': 'GP Bucket',
        'Length': '11 ft 2 in',
        'Width': '6 ft',
        'Height': '6 ft 6 in'
      },
      createdAt: new Date().toISOString()
    };
  } else if (equipmentId === 'mt-2') {
    return {
      id: 'mt-2',
      title: 'JCB 3CX Backhoe Loader',
      description: 'Versatile backhoe loader with 4x4, extendable dipper, and multiple attachments. This machine features a comfortable cab with AC, pilot controls, and excellent visibility. Ideal for construction, utility work, and landscaping.',
      price: 58000,
      currency: 'USD',
      year: '2020',
      make: 'JCB',
      model: '3CX',
      category: 'Backhoe Loaders',
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
        'Backhoe Bucket Width': '24 in',
        'Hours': '2,100 hrs',
        'Transmission': '4-Speed Synchro Shuttle',
        'Drive': '4x4',
        'Extendable Dipper': 'Yes',
        'Cab': 'Enclosed with AC and Heat',
        'Controls': 'Pilot',
        'Auxiliary Hydraulics': 'Yes',
        'Attachments Included': 'GP Bucket, Ditching Bucket',
        'Tire Size Front': '12.5/80-18',
        'Tire Size Rear': '16.9-28'
      },
      createdAt: new Date().toISOString()
    };
  } else {
    throw new Error('Equipment not found');
  }
}

// Function to get equipment details from IronPlanet
async function getIronPlanetDetails(equipmentId: string) {
  // In a real implementation, we would use a scraping service or API
  // For now, we'll return mock data
  console.log('Getting IronPlanet details for:', equipmentId);
  
  // Simulate scraping delay
  await new Promise(resolve => setTimeout(resolve, 550));
  
  // Return mock data
  if (equipmentId === 'ip-1') {
    return {
      id: 'ip-1',
      title: 'Caterpillar D6T Dozer',
      description: 'Low hour dozer with VPAT blade, rear ripper, and enclosed cab with AC. This machine has been well-maintained with recent service and is ready to work. Features include GPS ready, rear view camera, and excellent undercarriage.',
      price: 145000,
      currency: 'USD',
      year: '2018',
      make: 'Caterpillar',
      model: 'D6T',
      category: 'Dozers',
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
        'Ripper Type': '3-shank parallelogram',
        'Hours': '3,200 hrs',
        'Blade Type': 'VPAT',
        'Cab': 'Enclosed with AC and Heat',
        'Transmission': 'Powershift',
        'Track Type': 'Sealed and Lubricated',
        'Track Width': '30 in',
        'Track Shoes': 'Single Grouser',
        'Ground Pressure': '6.5 psi',
        'Additional Features': 'GPS Ready, Rear View Camera'
      },
      createdAt: new Date().toISOString()
    };
  } else if (equipmentId === 'ip-2') {
    return {
      id: 'ip-2',
      title: 'Komatsu WA380 Wheel Loader',
      description: 'Front end loader with GP bucket, good tires, and well-maintained. This machine features a comfortable cab with AC, ride control, and third valve hydraulics. Ideal for construction, aggregate handling, and material loading.',
      price: 88000,
      currency: 'USD',
      year: '2019',
      make: 'Komatsu',
      model: 'WA380',
      category: 'Wheel Loaders',
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
        'Tires': '23.5R25, 70% remaining',
        'Hours': '4,800 hrs',
        'Transmission': 'Automatic',
        'Cab': 'Enclosed with AC and Heat',
        'Ride Control': 'Yes',
        'Third Valve Hydraulics': 'Yes',
        'Steering': 'Articulated',
        'Differential': 'Limited Slip',
        'Bucket Type': 'General Purpose',
        'Additional Features': 'Rear View Camera, Load Scale'
      },
      createdAt: new Date().toISOString()
    };
  } else {
    throw new Error('Equipment not found');
  }
}