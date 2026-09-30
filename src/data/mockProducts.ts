import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'AeroPulse ANC Wireless Headphones',
    sku: 'AP-ANC-BLK-01',
    category: 'Audio & Tech',
    dropshipPrice: 42.50,
    suggestedRetailPrice: 89.99,
    stock: 148,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-fidelity active noise cancellation wireless over-ear headphones with 40mm graphene drivers, 45-hour battery life, and plush memory foam ear cushions.',
    features: [
      'Hybrid Active Noise Cancellation (-38dB)',
      '45-Hour Ultra-Long Playtime',
      'Bluetooth 5.3 with Multi-Point Pairing',
      'Fast USB-C Charging (10 mins = 5 hrs playback)',
      'Built-in Quad-Mic with AI Environmental Noise Reduction'
    ],
    specs: {
      weight: '254g',
      dimensions: '185 x 165 x 82 mm',
      material: 'Matte Polycarbonate, Protein Leather',
      origin: 'Shenzhen Warehouse, Hub B',
      fulfillmentTime: '24-48 Hours',
      warranty: '12 Months Replacement'
    },
    tags: ['Audio', 'Wireless', 'Best Seller', 'Travel'],
    rating: 4.8,
    reviewCount: 342,
    createdAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'prod-002',
    name: 'Lumivolt Magnetic 3-in-1 Fast Charger',
    sku: 'LV-M3-SLV-02',
    category: 'Mobile Accessories',
    dropshipPrice: 19.80,
    suggestedRetailPrice: 49.99,
    stock: 310,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b14e0745b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Foldable aircraft-grade aluminum charging stand designed for simultaneous Qi-compatible smartphone, smartwatch, and earbuds charging with heat-dissipating cooling ribs.',
    features: [
      '15W Max Mag-Safe Compatible Fast Charging',
      'Foldable Slim Travel Form Factor',
      'Intelligent Foreign Object Detection',
      'LED Ambient Nightstand Glow Ring'
    ],
    specs: {
      weight: '185g',
      dimensions: '140 x 70 x 18 mm (folded)',
      material: 'Anodized Aluminum Alloy',
      origin: 'Guangdong Tech Park',
      fulfillmentTime: '24 Hours',
      warranty: '24 Months'
    },
    tags: ['Accessories', 'Tech', 'MagSafe', 'Minimalist'],
    rating: 4.9,
    reviewCount: 512,
    createdAt: '2026-08-20T11:30:00Z'
  },
  {
    id: 'prod-003',
    name: 'Verve Minimalist Titanium Automatic Watch',
    sku: 'VV-TI-BLK-03',
    category: 'Watches & Jewelry',
    dropshipPrice: 68.00,
    suggestedRetailPrice: 165.00,
    stock: 24,
    stockStatus: 'low_stock',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Grade-2 brushed titanium mechanical timepiece featuring sapphire crystal glass, 5 ATM water resistance, and an interchangeable quick-release fluoroelastomer strap.',
    features: [
      'Japanese Miyota Automatic Movement',
      'Scratch-Proof Double-Domed Sapphire Crystal',
      'Super-LumiNova BGW9 Dial Accents',
      '50m Water Resistance'
    ],
    specs: {
      weight: '72g',
      dimensions: '40mm diameter, 10.5mm thickness',
      material: 'Grade-2 Titanium, Sapphire Glass',
      origin: 'Yokohama Logistics Hub',
      fulfillmentTime: '48 Hours',
      warranty: '36 Months'
    },
    tags: ['Watches', 'Luxury', 'High Margin'],
    rating: 4.7,
    reviewCount: 94,
    createdAt: '2026-07-12T08:15:00Z'
  },
  {
    id: 'prod-004',
    name: 'HyperGlow Ergonomic Mechanical Keyboard',
    sku: 'HG-KB-RGB-04',
    category: 'Computer Peripherals',
    dropshipPrice: 38.00,
    suggestedRetailPrice: 84.99,
    stock: 96,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
    ],
    description: '75% gasket-mounted hot-swappable tactile mechanical keyboard with factory pre-lubed switches, sound dampening silicon pads, and south-facing per-key RGB backlighting.',
    features: [
      'Hot-Swappable 5-Pin Switch Sockets',
      'Pre-lubricated Linear Red Switches',
      'Tri-Mode Connectivity (2.4Ghz, BT 5.1, Type-C)',
      'Double-Shot PBT Cherry Profile Keycaps'
    ],
    specs: {
      weight: '890g',
      dimensions: '320 x 135 x 38 mm',
      material: 'PBT Keycaps, CNC Accent Plate',
      origin: 'Dongguan Central Hub',
      fulfillmentTime: '24 Hours',
      warranty: '12 Months'
    },
    tags: ['Peripherals', 'Gaming', 'Office'],
    rating: 4.9,
    reviewCount: 288,
    createdAt: '2026-08-01T14:40:00Z'
  },
  {
    id: 'prod-005',
    name: 'Zenith Smart Ultrasonic Essential Oil Diffuser',
    sku: 'ZN-DF-OAK-05',
    category: 'Home & Living',
    dropshipPrice: 16.50,
    suggestedRetailPrice: 42.00,
    stock: 220,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Whisper-quiet 500ml ultrasonic aromatherapy diffuser featuring natural ceramic grain finish, ambient breathing LED mood lighting, and waterless auto-shutoff security.',
    features: [
      'Ultrasonic 2.4MHz Cool Mist Technology',
      'Continuous 14-Hour Operation',
      '7 Ambient Color Cycles with Dimmer',
      'Whisper Silent (<20dB) Night Sleep Mode'
    ],
    specs: {
      weight: '430g',
      dimensions: '168 x 168 x 120 mm',
      material: 'BPA-Free Polypropylene, Matte Ceramic Shell',
      origin: 'Yiwu Logistics Center',
      fulfillmentTime: '24-48 Hours',
      warranty: '12 Months'
    },
    tags: ['Home', 'Aromatherapy', 'Wellness'],
    rating: 4.6,
    reviewCount: 175,
    createdAt: '2026-07-28T09:20:00Z'
  },
  {
    id: 'prod-006',
    name: 'Nordic Ceramic Matte Pour-Over Coffee Set',
    sku: 'NC-CF-MTE-06',
    category: 'Kitchen & Dining',
    dropshipPrice: 22.00,
    suggestedRetailPrice: 55.00,
    stock: 58,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Artisan hand-finished stoneware dripper and 600ml borosilicate glass carafe set tailored for precision coffee extraction with thermal retention.',
    features: [
      'V60 Spiral Ridge Interior Extraction Geometry',
      'Thermal Shock-Resistant Borosilicate Carafe',
      'Heat-Insulated Walnut Wood Collar',
      'Dishwasher and Food-Safe Certified'
    ],
    specs: {
      weight: '620g',
      dimensions: '190 x 125 x 125 mm',
      material: 'Ceramic Stoneware, Borosilicate Glass',
      origin: 'Fujian Artisan Facility',
      fulfillmentTime: '24 Hours',
      warranty: 'Lifetime Craftsmanship'
    },
    tags: ['Coffee', 'Kitchen', 'Lifestyle'],
    rating: 4.8,
    reviewCount: 119,
    createdAt: '2026-08-04T12:00:00Z'
  },
  {
    id: 'prod-007',
    name: 'Nomad Water-Resistant Modular Backpack 28L',
    sku: 'NM-BP-28L-07',
    category: 'Bags & Travel',
    dropshipPrice: 34.00,
    suggestedRetailPrice: 79.99,
    stock: 82,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Weatherproof ballistic nylon urban pack with padded 16" laptop sleeve, hidden RFID security pocket, luggage trolley strap, and modular expandability.',
    features: [
      '900D Waterproof Cordura Outer Fabric',
      'Padded Suspended 16-inch Laptop Chamber',
      'TSA-Compliant 180° Clamshell Opening',
      'Ergonomic Breathable Air-Mesh Back Panel'
    ],
    specs: {
      weight: '980g',
      dimensions: '480 x 310 x 170 mm',
      material: 'Cordura 900D Nylon, YKK Zippers',
      origin: 'Shanghai Export Depot',
      fulfillmentTime: '24-48 Hours',
      warranty: '24 Months'
    },
    tags: ['Travel', 'Bags', 'Commute', 'Waterproof'],
    rating: 4.9,
    reviewCount: 420,
    createdAt: '2026-08-11T16:10:00Z'
  },
  {
    id: 'prod-008',
    name: 'PulseFlow Deep Tissue Massage Gun',
    sku: 'PF-MG-PRO-08',
    category: 'Health & Fitness',
    dropshipPrice: 29.50,
    suggestedRetailPrice: 74.00,
    stock: 12,
    stockStatus: 'low_stock',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Compact brushless motor percussion massage device delivering 3200 RPM therapeutic relief, 6 interchangeable silicone heads, and quiet glide technology.',
    features: [
      'High-Torque 3200 RPM Brushless Motor',
      '6 Targeted Ergonomic Attachment Heads',
      '2600mAh Battery (Up to 6 Hours Runtime)',
      'OLED Speed and Pressure Sensor Display'
    ],
    specs: {
      weight: '750g',
      dimensions: '220 x 170 x 60 mm',
      material: 'Aviation Aluminum, Silicone',
      origin: 'Shenzhen Tech Warehouse',
      fulfillmentTime: '24 Hours',
      warranty: '12 Months'
    },
    tags: ['Fitness', 'Recovery', 'Health'],
    rating: 4.7,
    reviewCount: 204,
    createdAt: '2026-07-19T13:45:00Z'
  },
  {
    id: 'prod-009',
    name: 'Solace Organic Linen Weighted Blanket',
    sku: 'SL-WB-15L-09',
    category: 'Home & Living',
    dropshipPrice: 48.00,
    suggestedRetailPrice: 119.00,
    stock: 0,
    stockStatus: 'out_of_stock',
    thumbnail: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
    ],
    description: '15-pound thermo-regulating French flax linen blanket filled with micro-glass beads sewn into double-stitched 4-inch pockets for even pressure distribution.',
    features: [
      '100% Certified Organic French Flax Linen',
      'Hypoallergenic Non-Toxic Micro-Glass Beads',
      'Natural All-Season Temperature Regulation',
      'Even Weight Distribution Technology'
    ],
    specs: {
      weight: '6.8 kg (15 lbs)',
      dimensions: '150 x 200 cm (Queen)',
      material: 'Organic Flax Linen, Micro Glass Beads',
      origin: 'Zhejiang Textile Depot',
      fulfillmentTime: '3-5 Days (Restocking)',
      warranty: '24 Months'
    },
    tags: ['Home', 'Sleep', 'Organic'],
    rating: 4.8,
    reviewCount: 88,
    createdAt: '2026-06-30T10:00:00Z'
  },
  {
    id: 'prod-010',
    name: 'Prism 4K Ultra-Wide Streaming Webcam',
    sku: 'PR-CAM-4K-10',
    category: 'Computer Peripherals',
    dropshipPrice: 32.00,
    suggestedRetailPrice: 79.99,
    stock: 140,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'True 4K UHD streaming camera with Sony STARVIS sensor, autofocus, dual stereo mics with beamforming noise cancellation, and physical privacy shutter.',
    features: [
      'Sony STARVIS Low-Light 4K Sensor',
      'AI Facial Auto-Framing & Fast Autofocus',
      'Dual Stereo Microphones with Echo Cancellation',
      'Built-in Sliding Physical Privacy Guard'
    ],
    specs: {
      weight: '160g',
      dimensions: '102 x 45 x 30 mm',
      material: 'ABS Polymer, Glass Lens',
      origin: 'Shenzhen Hub A',
      fulfillmentTime: '24 Hours',
      warranty: '12 Months'
    },
    tags: ['Peripherals', 'Streaming', 'Remote Work'],
    rating: 4.7,
    reviewCount: 167,
    createdAt: '2026-08-08T09:15:00Z'
  },
  {
    id: 'prod-011',
    name: 'Aura Ambient Smart LED Lightbar Pair',
    sku: 'AU-LB-RGB-11',
    category: 'Home & Living',
    dropshipPrice: 24.50,
    suggestedRetailPrice: 59.99,
    stock: 185,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Dual sync lighting bars with 16 million colors, audio visualizer beat synchronization, and magnetic modular desktop base mounts for displays and setups.',
    features: [
      'Music Reactive Audio Sync via Built-in Mic',
      '16M Color RGBIC Segmented Glow',
      'App and Smart Assistant Compatible',
      'Versatile Flat or Vertical Mounting'
    ],
    specs: {
      weight: '340g (pair)',
      dimensions: '300 x 35 x 35 mm each',
      material: 'Polycarbonate, Aluminum Base',
      origin: 'Dongguan Lighting Hub',
      fulfillmentTime: '24 Hours',
      warranty: '12 Months'
    },
    tags: ['Lighting', 'Gaming', 'Decor'],
    rating: 4.8,
    reviewCount: 310,
    createdAt: '2026-08-18T15:00:00Z'
  },
  {
    id: 'prod-012',
    name: 'Vessel Insulated Titanium Travel Flask 500ml',
    sku: 'VS-TF-500-12',
    category: 'Kitchen & Dining',
    dropshipPrice: 26.00,
    suggestedRetailPrice: 62.00,
    stock: 64,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ultralight double-wall vacuum insulated pure titanium bottle preserving beverages hot for 12 hours or cold for 24 hours without metallic flavor transfer.',
    features: [
      '100% Pure Ultralight Titanium Construction',
      'Vacuum Insulation Double-Wall Heat Barrier',
      'Leak-Proof Silicone Gasket Seal Cap',
      'Non-Corrosive and Taste Neutral'
    ],
    specs: {
      weight: '195g',
      dimensions: '225 x 68 mm',
      material: 'Pure Grade-1 Titanium',
      origin: 'Hangzhou Precision Foundry',
      fulfillmentTime: '24 Hours',
      warranty: 'Lifetime Guarantee'
    },
    tags: ['Drinkware', 'Titanium', 'Travel'],
    rating: 4.9,
    reviewCount: 145,
    createdAt: '2026-08-02T11:25:00Z'
  },
  {
    id: 'prod-013',
    name: 'Onyx Leather Magnetic Desk Mat & Cable Guide',
    sku: 'OX-DM-XL-13',
    category: 'Computer Peripherals',
    dropshipPrice: 18.00,
    suggestedRetailPrice: 44.95,
    stock: 190,
    stockStatus: 'in_stock',
    thumbnail: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Waterproof vegan top-grain leather desk pad with magnetic cable holder channel, anti-slip felt backing, and precision tracking for optical mice.',
    features: [
      'Spill-Proof Vegan Leather Surface',
      'Magnetic Modular Cable Organization Bar',
      'Eco-Friendly Suede Bottom Anti-Slip Grip',
      'Generous 90cm x 40cm XL Surface'
    ],
    specs: {
      weight: '520g',
      dimensions: '900 x 400 x 3 mm',
      material: 'PU Vegan Leather, Suede Felt',
      origin: 'Guangzhou Accessories Hub',
      fulfillmentTime: '24 Hours',
      warranty: '12 Months'
    },
    tags: ['Office', 'Desk', 'Minimalist'],
    rating: 4.7,
    reviewCount: 230,
    createdAt: '2026-07-25T14:10:00Z'
  },
  {
    id: 'prod-014',
    name: 'Serena Blue Light Blocking Acetate Glasses',
    sku: 'SR-GL-TOR-14',
    category: 'Watches & Jewelry',
    dropshipPrice: 14.50,
    suggestedRetailPrice: 38.00,
    stock: 5,
    stockStatus: 'low_stock',
    thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Handcrafted Italian acetate spectacles fitted with anti-glare HEV 420 blue light filtering CR-39 lenses to diminish screen eye fatigue and headaches.',
    features: [
      'Filters 99% Harmful High-Energy Blue Light',
      'Italian Mazzucchelli Cellulose Acetate Frames',
      'Flexible Spring Hinges for Universal Fit',
      'Anti-Scratch and Anti-Smudge Hydrophobic Coating'
    ],
    specs: {
      weight: '26g',
      dimensions: '51-19-145 mm',
      material: 'Mazzucchelli Acetate, Stainless Steel Core',
      origin: 'Wenzhou Optical Hub',
      fulfillmentTime: '24 Hours',
      warranty: '12 Months'
    },
    tags: ['Eyewear', 'Wellness', 'Office'],
    rating: 4.8,
    reviewCount: 188,
    createdAt: '2026-08-14T08:50:00Z'
  }
];
