import {
  ProductItem,
  ShadeItem,
  PaintingProject,
  OrderRecord,
  AppNotification
} from "../types";

export const DEFAULT_SHADE: ShadeItem = {
  code: "0122",
  name: "Pigeon Blue-N",
  hex: "#8ACEDA",
  brand: "Asian Paints",
  family: "blues",
  tinting_charge: 12.65,
};

export const JAMSHEDPUR_AREAS = [
  "Sakchi",
  "Bistupur",
  "Kadma",
  "Sonari",
  "Telco Colony",
  "Golmuri",
  "Baridih",
  "Mango",
  "Jugsalai",
  "Adityapur (Phase 1 & 2)",
  "Gamharia",
  "Sidhgora",
  "Bhurandih",
  "Parsudih",
  "Tinplate",
  "Govindpur",
  "Khasmahal",
  "Agrico",
  "Burmamines",
];

export const BRANDS_INFO = [
  {
    id: "Asian Paints",
    name: "Asian Paints",
    tagline: "Har Ghar Kuch Kehta Hai",
    accentColor: "#E11D48",
    bgLight: "#FFF1F2",
    logoText: "ASIAN PAINTS",
    popularProducts: "Royale Glitz, Apex Ultima, Apcolite",
    tintingMachine: "ColourIdea Automatic Tinting System",
    deliveryTime: "30-40 mins",
  },
  {
    id: "Berger Paints",
    name: "Berger Paints",
    tagline: "Paint Your Imagination",
    accentColor: "#2563EB",
    bgLight: "#EFF6FF",
    logoText: "BERGER",
    popularProducts: "Silk Glamor, WeatherCoat Long Life, Easy Clean",
    tintingMachine: "Colour World Spectro-Tint Dispenser",
    deliveryTime: "30-45 mins",
  },
  {
    id: "Birla Opus",
    name: "Birla Opus",
    tagline: "Make Life Beautiful - Grasim Paints",
    accentColor: "#D97706",
    bgLight: "#FEF3C7",
    logoText: "BIRLA OPUS",
    popularProducts: "One Pure Elegance, Prime Style, Calista Sheen",
    tintingMachine: "Opus FastStudio Automated Dispenser",
    deliveryTime: "25-35 mins",
  },
  {
    id: "Hardware & Tools",
    name: "Tools & Hardware",
    tagline: "Brushes, Rollers, Putty, Sandpaper & Tapes",
    accentColor: "#4F46E5",
    bgLight: "#EEF2FF",
    logoText: "NIKHIL PRO TOOLS",
    popularProducts: "TruCare Pro Rollers, Masking Tapes, Dr. Fixit",
    tintingMachine: "Ready to Dispatch Stock",
    deliveryTime: "20-30 mins",
  },
];

// Algorithmic search helper across 7,000+ shade codes
export function search7000Shades(
  query: string,
  familyFilter?: string,
): ShadeItem[] {
  const q = query.trim().toUpperCase();
  let matches: ShadeItem[] = [];

  // If search query is a specific numeric code or custom code (like "0123", "L294", "9412", "RAL 7035", "BO-4001")
  // Generate deterministic shade code record so custom codes can be picked!
  if (q && q.length >= 2) {
    const isCodeMatch = /^[A-Z0-9\-\s]{2,10}$/i.test(q);

    if (isCodeMatch) {
      // Deterministically derive realistic color hex from code string hash
      let hash = 0;
      for (let i = 0; i < q.length; i++) {
        hash = q.charCodeAt(i) + ((hash << 5) - hash);
      }

      const r = Math.min(245, Math.max(30, (Math.abs(hash) % 200) + 40));
      const g = Math.min(245, Math.max(30, (Math.abs(hash * 3) % 200) + 40));
      const b = Math.min(245, Math.max(30, (Math.abs(hash * 7) % 200) + 40));

      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

      let derivedFamily: ShadeItem["family"] = "Greys & Charcoals";
      if (r > 220 && g > 220 && b > 210) derivedFamily = "Whites & Off-Whites";
      else if (r > 200 && g > 180 && b < 160)
        derivedFamily = "Warm Creams & Beiges";
      else if (r > 190 && g > 160 && b < 100) derivedFamily = "Yellows & Golds";
      else if (r > 150 && g < 100 && b < 100)
        derivedFamily = "Reds & Terracotta";
      else if (b > r && b > g) derivedFamily = "Blues & Teals";
      else if (g > r && g > b) derivedFamily = "Greens & Olives";
      else if (r > 120 && b > 120 && g < 100)
        derivedFamily = "Purples & Violets";

      let brandTag: ShadeItem["brand"] = "Asian Paints";
      if (q.startsWith("BO") || q.startsWith("OP")) brandTag = "Birla Opus";
      else if (q.startsWith("PPU") || q.startsWith("BG"))
        brandTag = "Berger Paints";
      else if (q.startsWith("RAL")) brandTag = "RAL";

      const customShade: ShadeItem = {
        code: q,
        name: `${brandTag} Shade ${q}`,
        brand: brandTag,
        hex,
        rgb: [r, g, b],
        family: derivedFamily,
        fandeck: "Nikhil Paints Master 7000+ Dispenser Archive",
        popularity: 75,
        recommendedPairs: ["0427", "L152"],
        description: `Verified computerized tint formula ready for instant machine mixing at Nikhil Paints Sakchi depot.`,
      };

      if (
        !familyFilter ||
        familyFilter === "All" ||
        customShade.family === familyFilter
      ) {
        matches.push(customShade);
      }
    }
  }

  return matches;
}

const LEGACY_PRODUCTS_CATALOG: ProductItem[] = [
  // 1. Asian Paints Royale Luxury
  {
    id: "tractor economy emulsion ",
    name: "Asian Paints Tractor Economy Emulsion",
    brand: "Asian Paints",
    category: "Interior Emulsion",
    tagline: "Economical yet High-Quality Interior Emulsion",
    rating: 4.9,
    reviewsCount: 328,
    deliveryMinutes: 35,
    features: [
      "Economical yet High-Quality Interior Emulsion",
      "Teflon surface protector (stains wipe off with wet cloth)",
      "Anti-fungal & crack-bridging polymer matrix",
      "Low VOC and zero odor for immediate occupancy",
    ],
    coveragePerLiter: "140 - 160 sq.ft / 2 coats",
    warrantyYears: 8,
    finish: "Sheen",
    washability: "Best-in-Class (10,000+ scrubs)",
    image:
      "https://www.indiamart.com/proddetail/asian-paints-tractor-emulsion-1-ltr-23799250497.html?srsltid=AfmBOopJBv_uWKMbQVkN-72b7yRL-_cUAPet18g-i399pY4UaA_NZ2yW",
    requiresShade: true,
    defaultShadeCode: "0427",
    badge: "Bestseller",
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 610,
        originalPrice: 690,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 2350,
        originalPrice: 2650,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 5690,
        originalPrice: 6400,
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: 10890,
        originalPrice: 12200,
        inStock: true,
      },
    ],
  },
  // 2. Birla Opus One Pure Elegance
  {
    id: "bo-one-elegance",
    name: "Birla Opus One Pure Elegance Luxury Emulsion",
    brand: "Birla Opus",
    category: "Interior Emulsion",
    tagline: "Grasim Next-Gen Nano-Polymer with Unmatched Depth of Color",
    rating: 4.9,
    reviewsCount: 184,
    deliveryMinutes: 30,
    features: [
      "Nano-crystal pigment technology for rich vibrancy",
      "Micro-porous breathable finish prevents peeling",
      "Washable with standard soap solution",
      "Computerized express tinting guarantee",
    ],
    coveragePerLiter: "150 - 170 sq.ft / 2 coats",
    warrantyYears: 10,
    finish: "Soft Sheen",
    washability: "Best-in-Class (10,000+ scrubs)",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80",
    requiresShade: true,
    defaultShadeCode: "BO-1002",
    badge: "New Launch",
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 580,
        originalPrice: 650,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 2240,
        originalPrice: 2500,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 5350,
        originalPrice: 6000,
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: 10200,
        originalPrice: 11500,
        inStock: true,
      },
    ],
  },
  // 3. Berger Silk Glamor
  {
    id: "berger-silk-glamor",
    name: "Berger Silk Glamor Luxury Interior Emulsion",
    brand: "Berger Paints",
    category: "Interior Emulsion",
    tagline: "Formulated with 100% Acrylic Polyurethane for Silken Finish",
    rating: 4.8,
    reviewsCount: 245,
    deliveryMinutes: 35,
    features: [
      "Luxurious silken smooth touch",
      "Elastomeric film prevents micro-cracks",
      "Anti-bacterial active silver ion shields",
      "Environment friendly low odor",
    ],
    coveragePerLiter: "135 - 155 sq.ft / 2 coats",
    warrantyYears: 8,
    finish: "Sheen",
    washability: "High",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    requiresShade: true,
    defaultShadeCode: "PPU-18-04",
    badge: "Popular",
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 540,
        originalPrice: 620,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 2090,
        originalPrice: 2380,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 4990,
        originalPrice: 5650,
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: 9550,
        originalPrice: 10800,
        inStock: true,
      },
    ],
  },
  // 4. Asian Paints Apex Ultima Protek (Exterior)
  {
    id: "ap-apex-ultima-protek",
    name: "Asian Paints Apex Ultima Protek Duralife Exterior",
    brand: "Asian Paints",
    category: "Exterior Emulsion",
    tagline:
      "Laminated Waterproofing System with 10 Year Durability in Rain & Heat",
    rating: 4.9,
    reviewsCount: 412,
    deliveryMinutes: 40,
    features: [
      "10-Year Performance & Anti-Algae Warranty",
      "Nano-additive dust pick-up resistance",
      "High structural crack bridging (up to 2mm)",
      "Engineered for heavy Chotanagpur monsoons",
    ],
    coveragePerLiter: "55 - 65 sq.ft / 2 coats (including base coat)",
    warrantyYears: 10,
    finish: "Sheen",
    washability: "Best-in-Class (10,000+ scrubs)",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
    requiresShade: true,
    defaultShadeCode: "8234",
    badge: "Monsoon Shield",
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 595,
        originalPrice: 680,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 2320,
        originalPrice: 2600,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 5550,
        originalPrice: 6200,
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: 10600,
        originalPrice: 11900,
        inStock: true,
      },
    ],
  },
  // 5. Berger WeatherCoat Long Life 10
  {
    id: "berger-weathercoat-10",
    name: "Berger WeatherCoat Long Life 10 Exterior Paint",
    brand: "Berger Paints",
    category: "Exterior Emulsion",
    tagline: "Silicon PU & Nanotech for 10-Year Anti-Fading Guarantee",
    rating: 4.8,
    reviewsCount: 198,
    deliveryMinutes: 35,
    features: [
      "Heavy rain & anti-fungal protection",
      "Silicon additives repel tropical rainstorm moisture",
      "Rich vibrant color retention under strong UV",
      "Self-cleaning rain-wash surface",
    ],
    coveragePerLiter: "60 - 70 sq.ft / 2 coats",
    warrantyYears: 10,
    finish: "Sheen",
    washability: "High",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80",
    requiresShade: true,
    defaultShadeCode: "7412",
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 560,
        originalPrice: 640,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 2180,
        originalPrice: 2450,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 5200,
        originalPrice: 5850,
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: 9950,
        originalPrice: 11200,
        inStock: true,
      },
    ],
  },
  // 6. Birla Opus AllWeather Shield Exterior
  {
    id: "bo-allweather-shield",
    name: "Birla Opus AllWeather Shield Exterior Emulsion",
    brand: "Birla Opus",
    category: "Exterior Emulsion",
    tagline: "Cross-Linked Elastomeric Anti-Heat & Anti-Moisture Barrier",
    rating: 4.9,
    reviewsCount: 112,
    deliveryMinutes: 35,
    features: [
      "Reflects 85% infrared solar heat to keep interiors cooler",
      "Ultra high water-beading hydrophobic shield",
      "Resistant to industrial pollution and steel mill dust",
      "12-Year color stability warranty",
    ],
    coveragePerLiter: "65 - 75 sq.ft / 2 coats",
    warrantyYears: 12,
    finish: "Matt",
    washability: "Best-in-Class (10,000+ scrubs)",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80",
    requiresShade: true,
    defaultShadeCode: "BO-5109",
    badge: "Heat Cool Tech",
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 575,
        originalPrice: 650,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 2250,
        originalPrice: 2520,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 5390,
        originalPrice: 6050,
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: 10300,
        originalPrice: 11600,
        inStock: true,
      },
    ],
  },
  // 7. Asian Paints SmartCare Damp Block 2K (Waterproofing)
  {
    id: "ap-smartcare-dampblock",
    name: "Asian Paints SmartCare Damp Block 2K Waterproofing",
    brand: "Asian Paints",
    category: "Waterproofing",
    tagline:
      "2-Component Polymer Modified Cementitious Coating for Severe Dampness",
    rating: 4.9,
    reviewsCount: 520,
    deliveryMinutes: 30,
    features: [
      "Positive & negative side hydrostatic pressure resistance up to 4 bars",
      "Stops rising dampness on interior base walls & skirting",
      "Excellent adhesion to concrete & plaster masonry",
      "Can be directly plastered or puttied over",
    ],
    coveragePerLiter: "15 - 18 sq.ft / 2 coats per kg pack",
    warrantyYears: 5,
    finish: "Rough Texture",
    washability: "High",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    requiresShade: false,
    badge: "Essential Monsoon",
    packs: [
      {
        size: "3 Kg Pack",
        volumeLiters: 3,
        price: 460,
        originalPrice: 520,
        inStock: true,
      },
      {
        size: "6 Kg Pack",
        volumeLiters: 6,
        price: 890,
        originalPrice: 990,
        inStock: true,
      },
      {
        size: "15 Kg Bucket",
        volumeLiters: 15,
        price: 2150,
        originalPrice: 2400,
        inStock: true,
      },
    ],
  },
  // 8. Asian Paints TruCare Wall Primer (Water Based)
  {
    id: "ap-trucare-primer",
    name: "Asian Paints TruCare Wall Primer (Interior Decoprime)",
    brand: "Asian Paints",
    category: "Primers & Putty",
    tagline: "Superior Opacity & Alkali Resistance for Flawless Color Output",
    rating: 4.8,
    reviewsCount: 680,
    deliveryMinutes: 25,
    features: [
      "Seals plaster porosity to save expensive topcoat paint",
      "Anti-alkali formula prevents paint peeling & white patch formation",
      "Fast drying in 30 minutes",
      "Enhances shade richness by 30%",
    ],
    coveragePerLiter: "120 - 140 sq.ft / single coat",
    finish: "Matt",
    washability: "Medium",
    image:
      "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?w=600&auto=format&fit=crop&q=80",
    requiresShade: false,
    badge: "Super Saver",
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 160,
        originalPrice: 190,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 580,
        originalPrice: 690,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 1380,
        originalPrice: 1620,
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: 2590,
        originalPrice: 3050,
        inStock: true,
      },
    ],
  },
  // 9. Birla Opus Stucco Acrylic Wall Putty
  {
    id: "bo-stucco-putty",
    name: "Birla Opus Ultra Fine White Polymer Wall Putty",
    brand: "Birla Opus",
    category: "Primers & Putty",
    tagline: "Ultra White Marble Dust Base for Glass-Smooth Wall Base",
    rating: 4.9,
    reviewsCount: 390,
    deliveryMinutes: 35,
    features: [
      "High tensile polymer strength prevents pinholes and shrinkage",
      "True 94%+ whiteness score",
      "Water resistant matrix prevents moisture penetration into paint",
      "Smoothest sanding experience for painters",
    ],
    coveragePerLiter: "15 - 18 sq.ft / 2 coats per 1 kg",
    finish: "Matt",
    washability: "Low",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
    requiresShade: false,
    packs: [
      {
        size: "5 Kg Bag",
        volumeLiters: 5,
        price: 210,
        originalPrice: 250,
        inStock: true,
      },
      {
        size: "20 Kg Bag",
        volumeLiters: 20,
        price: 780,
        originalPrice: 900,
        inStock: true,
      },
      {
        size: "40 Kg Pro Sack",
        volumeLiters: 40,
        price: 1420,
        originalPrice: 1650,
        inStock: true,
      },
    ],
  },
  // 10. Asian Paints Apcolite Premium Satin Enamel (Wood & Metal)
  {
    id: "ap-apcolite-enamel",
    name: "Asian Paints Apcolite Premium Gloss & Satin Enamel",
    brand: "Asian Paints",
    category: "Wood & Metal Enamel",
    tagline:
      "Mirror Like Tough Protective Coating for Doors, Grills & Furniture",
    rating: 4.8,
    reviewsCount: 310,
    deliveryMinutes: 30,
    features: [
      "Anti-rust inhibitor for steel gates & window grills",
      "High impact toughness resistant to everyday scratches",
      "Non-yellowing white & high depth gloss",
      "Available in full 7000+ custom tintable shades",
    ],
    coveragePerLiter: "100 - 120 sq.ft / 2 coats",
    warrantyYears: 5,
    finish: "High Gloss",
    washability: "Best-in-Class (10,000+ scrubs)",
    image:
      "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=600&auto=format&fit=crop&q=80",
    requiresShade: true,
    defaultShadeCode: "RAL-7016",
    packs: [
      {
        size: "500 ml",
        volumeLiters: 0.5,
        price: 210,
        originalPrice: 240,
        inStock: true,
      },
      {
        size: "1 Litre",
        volumeLiters: 1,
        price: 390,
        originalPrice: 440,
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: 1480,
        originalPrice: 1680,
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: 3550,
        originalPrice: 4000,
        inStock: true,
      },
    ],
  },
  // 11. Hardware Tools - Professional Roller Kit
  {
    id: "tool-pro-roller-kit",
    name: "Nikhil Master Painter Microfiber 9-Inch Roller & Tray Kit",
    brand: "Hardware & Tools",
    category: "Brushes & Tools",
    tagline:
      "Zero Shedding Woven Microfiber for Uniform Streak-Free Wall Coverage",
    rating: 4.9,
    reviewsCount: 450,
    deliveryMinutes: 20,
    features: [
      "Heavy duty 9-inch cage frame with ergonomic soft-grip handle",
      "Includes 2x high-density microfiber refill sleeves",
      "Sturdy textured deep paint roller tray with pour spout",
      "Saves 25% paint wastage compared to standard brushes",
    ],
    coveragePerLiter: "N/A",
    finish: "Matt",
    washability: "Medium",
    image:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
    requiresShade: false,
    badge: "Essential Tool",
    packs: [
      {
        size: "Complete Set (Roller + 2 Sleeves + Tray)",
        volumeLiters: 0,
        price: 340,
        originalPrice: 450,
        inStock: true,
      },
      {
        size: "2x Roller Sleeve Refills Only",
        volumeLiters: 0,
        price: 180,
        originalPrice: 240,
        inStock: true,
      },
    ],
  },
  // 12. TruCare Bristle Brushes Set (2", 3", 4")
  {
    id: "tool-trucare-brush-set",
    name: 'Asian Paints TruCare Professional Bristle Brush Combo (2" + 3" + 4")',
    brand: "Hardware & Tools",
    category: "Brushes & Tools",
    tagline: "High Paint Holding Capacity for Edging, Cornices & Trims",
    rating: 4.8,
    reviewsCount: 380,
    deliveryMinutes: 20,
    features: [
      "100% boiled natural bristles with epoxy locked stainless ferrules",
      "No bristle fallout during wall painting",
      "Tapered filament tips for sharp cutting-in lines and door corners",
      "Includes 2-inch, 3-inch, and 4-inch pro brushes",
    ],
    coveragePerLiter: "N/A",
    finish: "Matt",
    washability: "Medium",
    image:
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
    requiresShade: false,
    packs: [
      {
        size: 'Trio Pack (2" + 3" + 4")',
        volumeLiters: 0,
        price: 260,
        originalPrice: 350,
        inStock: true,
      },
      {
        size: 'Single 4" Wide Wall Brush',
        volumeLiters: 0,
        price: 120,
        originalPrice: 160,
        inStock: true,
      },
    ],
  },
  // 13. Masking Tape & Protection Sheet Combo
  {
    id: "tool-masking-combo",
    name: "Pro Painter Floor Protection Sheet (20x10 ft) + 3x Masking Tape Rolls",
    brand: "Hardware & Tools",
    category: "Brushes & Tools",
    tagline:
      "Protects Tiles, Marble & Switchboards from Paint Drips & Splatters",
    rating: 4.9,
    reviewsCount: 290,
    deliveryMinutes: 20,
    features: [
      "Heavy duty 100 micron anti-slip plastic floor drop sheet",
      "3x 24mm high-adhesion creped masking tape rolls (no glue residue)",
      "Quick cleanup and zero floor stains guaranteed",
    ],
    coveragePerLiter: "N/A",
    finish: "Matt",
    washability: "Low",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80",
    requiresShade: false,
    packs: [
      {
        size: "Standard Kit (1 Sheet + 3 Tapes)",
        volumeLiters: 0,
        price: 290,
        originalPrice: 380,
        inStock: true,
      },
      {
        size: "Contractor Pack (3 Sheets + 10 Tapes)",
        volumeLiters: 0,
        price: 820,
        originalPrice: 1100,
        inStock: true,
      },
    ],
  },
];

type CatalogPaintInput = Pick<
  ProductItem,
  "id" | "name" | "brand" | "category" | "tagline" | "finish" | "badge"
> & {
  price: number;
};

const createCatalogPaint = ({
  id,
  name,
  brand,
  category,
  tagline,
  finish,
  badge,
  price,
}: CatalogPaintInput): ProductItem => {
  const isExterior = category === "Exterior Emulsion";
  const image = isExterior
    ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80"
    : "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80";

  return {
    id,
    name,
    brand,
    category,
    tagline,
    rating: 4.7,
    reviewsCount: 100,
    deliveryMinutes: 35,
    features: [
      `Suitable for ${isExterior ? "exterior walls" : "interior walls"}`,
      "Computerized shade tinting available",
      "Available in selected pack sizes",
      "Ask the store team for surface-preparation guidance",
    ],
    coveragePerLiter: isExterior
      ? "60 - 75 sq.ft / litre / 2 coats"
      : "120 - 150 sq.ft / litre / 2 coats",
    finish,
    washability: isExterior ? "High" : "Medium",
    image,
    requiresShade: true,
    defaultShadeCode:
      brand === "Birla Opus"
        ? "BO-1002"
        : brand === "Berger Paints"
          ? "PPU-18-04"
          : "0427",
    badge,
    packs: [
      {
        size: "1 Litre",
        volumeLiters: 1,
        price,
        originalPrice: Math.round(price * 1.1),
        inStock: true,
      },
      {
        size: "4 Litres",
        volumeLiters: 4,
        price: price * 4,
        originalPrice: Math.round(price * 4.1),
        inStock: true,
      },
      {
        size: "10 Litres",
        volumeLiters: 10,
        price: price * 10,
        originalPrice: Math.round(price * 10.1),
        inStock: true,
      },
      {
        size: "20 Litres",
        volumeLiters: 20,
        price: price * 20,
        originalPrice: Math.round(price * 20.1),
        inStock: true,
      },
    ],
  };
};

export const PRODUCTS_CATALOG: ProductItem[] = [
  // Asian Paints - Interior
  createCatalogPaint({
    id: "ap-tractor-emulsion",
    name: "Asian Paints Tractor Emulsion",
    brand: "Asian Paints",
    category: "Interior Emulsion",
    tagline: "Everyday interior emulsion",
    finish: "Matt",
    price: 220,
    badge: "Value Pick",
  }),
  createCatalogPaint({
    id: "ap-apcolite-shyne",
    name: "Asian Paints Apcolite Shyne",
    brand: "Asian Paints",
    category: "Interior Emulsion",
    tagline: "Smooth sheen interior finish",
    finish: "Sheen",
    price: 360,
  }),
  createCatalogPaint({
    id: "ap-royale-shyne",
    name: "Asian Paints Royale Shyne",
    brand: "Asian Paints",
    category: "Interior Emulsion",
    tagline: "Premium washable sheen finish",
    finish: "Sheen",
    price: 470,
    badge: "Popular",
  }),
  createCatalogPaint({
    id: "ap-royale-glitz",
    name: "Asian Paints Royale Glitz",
    brand: "Asian Paints",
    category: "Interior Emulsion",
    tagline: "Luxury interior emulsion",
    finish: "Soft Sheen",
    price: 570,
    badge: "Bestseller",
  }),

  // Asian Paints - Exterior
  createCatalogPaint({
    id: "ap-ace",
    name: "Asian Paints Ace",
    brand: "Asian Paints",
    category: "Exterior Emulsion",
    tagline: "Reliable exterior wall protection",
    finish: "Matt",
    price: 250,
  }),
  createCatalogPaint({
    id: "ap-apex-dust-proof",
    name: "Asian Paints Apex Dust Proof",
    brand: "Asian Paints",
    category: "Exterior Emulsion",
    tagline: "Exterior finish with dust-resistance focus",
    finish: "Matt",
    price: 360,
  }),
  createCatalogPaint({
    id: "ap-apex-ultima",
    name: "Asian Paints Apex Ultima",
    brand: "Asian Paints",
    category: "Exterior Emulsion",
    tagline: "Premium exterior wall emulsion",
    finish: "Sheen",
    price: 470,
    badge: "Monsoon Pick",
  }),
  createCatalogPaint({
    id: "ap-apex-ultima-protek",
    name: "Asian Paints Apex Ultima Protek",
    brand: "Asian Paints",
    category: "Exterior Emulsion",
    tagline: "Advanced exterior protection range",
    finish: "Sheen",
    price: 590,
    badge: "Premium",
  }),

  // Berger - Interior
  createCatalogPaint({
    id: "berger-bison-emulsion",
    name: "Berger Bison Emulsion",
    brand: "Berger Paints",
    category: "Interior Emulsion",
    tagline: "Everyday interior emulsion",
    finish: "Matt",
    price: 230,
  }),
  createCatalogPaint({
    id: "berger-easy-clean",
    name: "Berger Easy Clean",
    brand: "Berger Paints",
    category: "Interior Emulsion",
    tagline: "Easy-clean interior wall finish",
    finish: "Sheen",
    price: 370,
    badge: "Popular",
  }),
  createCatalogPaint({
    id: "berger-silk-glamor",
    name: "Berger Silk Glamor",
    brand: "Berger Paints",
    category: "Interior Emulsion",
    tagline: "Luxury silky interior finish",
    finish: "Soft Sheen",
    price: 540,
    badge: "Premium",
  }),

  // Berger - Exterior
  createCatalogPaint({
    id: "berger-walmasta",
    name: "Berger Walmasta",
    brand: "Berger Paints",
    category: "Exterior Emulsion",
    tagline: "Exterior emulsion for everyday protection",
    finish: "Matt",
    price: 250,
  }),
  createCatalogPaint({
    id: "berger-weathercoat-smooth",
    name: "Berger WeatherCoat Smooth",
    brand: "Berger Paints",
    category: "Exterior Emulsion",
    tagline: "Smooth exterior wall finish",
    finish: "Matt",
    price: 380,
  }),
  createCatalogPaint({
    id: "berger-weathercoat-long-life",
    name: "Berger WeatherCoat Long Life",
    brand: "Berger Paints",
    category: "Exterior Emulsion",
    tagline: "Long-life exterior protection",
    finish: "Sheen",
    price: 560,
    badge: "Monsoon Pick",
  }),

  // Birla Opus - Interior
  createCatalogPaint({
    id: "bo-color-fresh",
    name: "Birla Opus Color Fresh",
    brand: "Birla Opus",
    category: "Interior Emulsion",
    tagline: "Fresh everyday interior colours",
    finish: "Matt",
    price: 230,
  }),
  createCatalogPaint({
    id: "bo-color-smart",
    name: "Birla Opus Color Smart",
    brand: "Birla Opus",
    category: "Interior Emulsion",
    tagline: "Smart interior emulsion finish",
    finish: "Sheen",
    price: 330,
  }),
  createCatalogPaint({
    id: "bo-ever-clear",
    name: "Birla Opus Ever Clear",
    brand: "Birla Opus",
    category: "Interior Emulsion",
    tagline: "Clear, durable interior finish",
    finish: "Sheen",
    price: 420,
  }),
  createCatalogPaint({
    id: "bo-one-pure-elegance-shyne",
    name: "Birla Opus One Pure Elegance Shyne",
    brand: "Birla Opus",
    category: "Interior Emulsion",
    tagline: "Luxury shiny interior emulsion",
    finish: "Soft Sheen",
    price: 580,
    badge: "Premium",
  }),

  // Birla Opus - Exterior
  createCatalogPaint({
    id: "bo-power-fit",
    name: "Birla Opus Power Fit",
    brand: "Birla Opus",
    category: "Exterior Emulsion",
    tagline: "Exterior wall protection range",
    finish: "Matt",
    price: 260,
  }),
  createCatalogPaint({
    id: "bo-power-bright",
    name: "Birla Opus Power Bright",
    brand: "Birla Opus",
    category: "Exterior Emulsion",
    tagline: "Bright exterior colour finish",
    finish: "Matt",
    price: 340,
  }),
  createCatalogPaint({
    id: "bo-neo-star",
    name: "Birla Opus Neo Star",
    brand: "Birla Opus",
    category: "Exterior Emulsion",
    tagline: "Advanced exterior emulsion",
    finish: "Sheen",
    price: 430,
  }),
  createCatalogPaint({
    id: "bo-true-look",
    name: "Birla Opus True Look",
    brand: "Birla Opus",
    category: "Exterior Emulsion",
    tagline: "Exterior colour and finish range",
    finish: "Sheen",
    price: 500,
  }),
  createCatalogPaint({
    id: "bo-true-life",
    name: "Birla Opus True Life",
    brand: "Birla Opus",
    category: "Exterior Emulsion",
    tagline: "Premium exterior protection range",
    finish: "Sheen",
    price: 590,
    badge: "Premium",
  }),

  // Keep non-emulsion items from the original catalog.
  ...LEGACY_PRODUCTS_CATALOG.filter(
    (product) =>
      !(
        (product.brand === "Asian Paints" ||
          product.brand === "Berger Paints" ||
          product.brand === "Birla Opus") &&
        (product.category === "Interior Emulsion" ||
          product.category === "Exterior Emulsion")
      ),
  ),
];

export const INITIAL_ORDERS_HISTORY: OrderRecord[] = [
  {
    id: "NK-84291",
    date: "14 Aug 2026, 11:20 AM",
    items: [
      {
        id: "cart-101",
        productId: "ap-royale-glitz",
        productName: "Asian Paints Royale Glitz Luxury Emulsion",
        brand: "Asian Paints",
        category: "Interior Emulsion",
        image:
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
        pack: {
          size: "10 Litres",
          volumeLiters: 10,
          price: 5690,
          originalPrice: 6400,
          inStock: true,
        },
        quantity: 1,
        selectedShade: DEFAULT_SHADE,
        tintingCharge: 80,
      },
      {
        id: "cart-102",
        productId: "tool-pro-roller-kit",
        productName:
          "Nikhil Master Painter Microfiber 9-Inch Roller & Tray Kit",
        brand: "Hardware & Tools",
        category: "Brushes & Tools",
        image:
          "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
        pack: {
          size: "Complete Set (Roller + 2 Sleeves + Tray)",
          volumeLiters: 0,
          price: 340,
          originalPrice: 450,
          inStock: true,
        },
        quantity: 1,
        tintingCharge: 0,
      },
    ],
    subtotal: 6030,
    tintingCharges: 80,
    deliveryFee: 0,
    loyaltyDiscount: 150,
    tax: 320,
    total: 6280,
    deliverySlot: "Delivered in 38 mins",
    address: {
      fullName: "Vikash Sharma",
      phone: "+91 94311 88421",
      area: "Bistupur",
      streetAddress: "Flat 4B, Regal Heights, Near Ram Mandir",
      pincode: "831001",
      city: "Jamshedpur",
    },
    paymentMethod: "UPI (PhonePe)",
    paymentStatus: "Paid",
    status: "Delivered",
    estimatedDeliveryTime: "Delivered at 11:58 AM",
    trackingStepIndex: 4,
    batchFormulaId: "AP-COLOURIDEA-TINT-89104-BISTUPUR",
    riderInfo: {
      name: "Rajesh Kumar Mahto",
      phone: "+91 98351 77312",
      vehicleNumber: "JH-05-BQ-4412 (Honda Activa)",
      rating: 4.95,
      currentLatOffset: 0,
      currentLngOffset: 0,
    },
  },
  {
    id: "NK-82105",
    date: "02 Aug 2026, 04:15 PM",
    items: [
      {
        id: "cart-103",
        productId: "bo-one-elegance",
        productName: "Birla Opus One Pure Elegance Luxury Emulsion",
        brand: "Birla Opus",
        category: "Interior Emulsion",
        image:
          "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80",
        pack: {
          size: "4 Litres",
          volumeLiters: 4,
          price: 2240,
          originalPrice: 2500,
          inStock: true,
        },
        quantity: 2,
        selectedShade: DEFAULT_SHADE,
        tintingCharge: 120,
      },
      {
        id: "cart-104",
        productId: "ap-smartcare-dampblock",
        productName: "Asian Paints SmartCare Damp Block 2K Waterproofing",
        brand: "Asian Paints",
        category: "Waterproofing",
        image:
          "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
        pack: {
          size: "6 Kg Pack",
          volumeLiters: 6,
          price: 890,
          originalPrice: 990,
          inStock: true,
        },
        quantity: 1,
        tintingCharge: 0,
      },
    ],
    subtotal: 5370,
    tintingCharges: 120,
    deliveryFee: 0,
    loyaltyDiscount: 100,
    tax: 280,
    total: 5670,
    deliverySlot: "Delivered in 42 mins",
    address: {
      fullName: "Vikash Sharma",
      phone: "+91 94311 88421",
      area: "Sakchi",
      streetAddress: "Holding 14, Kalimati Road, Near Jubilee Park Gate",
      pincode: "831001",
      city: "Jamshedpur",
    },
    paymentMethod: "Google Pay",
    paymentStatus: "Paid",
    status: "Delivered",
    estimatedDeliveryTime: "Delivered at 04:57 PM",
    trackingStepIndex: 4,
    batchFormulaId: "BO-DISPENSER-BATCH-4419-SAKCHI",
    riderInfo: {
      name: "Amit Soren",
      phone: "+91 91223 66491",
      vehicleNumber: "JH-05-CP-9902 (Bajaj Pulsar)",
      rating: 4.88,
      currentLatOffset: 0,
      currentLngOffset: 0,
    },
  },
];

export const INITIAL_PROJECTS: PaintingProject[] = [
  {
    id: "proj-1",
    name: "3BHK Duplex Renovation - Kadma",
    status: "In Progress",
    location: "Kadma Uliyan, Jamshedpur",
    startDate: "10 Aug 2026",
    targetCompletionDate: "25 Aug 2026",
    budget: 45000,
    spent: 28400,
    notes:
      "Base waterproofing done with SmartCare 2K. Applying 2 coats of Asian Paints Royale Glitz with Morning Glory (0427) and Deep Ocean Accent wall.",
    contractorName: "Manish Mistri (Certified Asian Paints Painter)",
    contractorPhone: "+91 94313 55210",
    rooms: [
      {
        roomName: "Living & Dining Hall",
        wallAreaSqFt: 540,
        selectedShade: DEFAULT_SHADE,
        paintProduct: "Asian Paints Royale Glitz",
        litersRequired: 8,
        litersOrdered: 10,
        coatsDone: 2,
        coatsTarget: 2,
      },
      {
        roomName: "Master Bedroom Feature Wall",
        wallAreaSqFt: 180,
        selectedShade: DEFAULT_SHADE,
        paintProduct: "Birla Opus One Pure Elegance",
        litersRequired: 3,
        litersOrdered: 4,
        coatsDone: 1,
        coatsTarget: 2,
      },
      {
        roomName: "Kids Bedroom & Study",
        wallAreaSqFt: 360,
        selectedShade: DEFAULT_SHADE,
        paintProduct: "Berger Silk Glamor",
        litersRequired: 5,
        litersOrdered: 5,
        coatsDone: 0,
        coatsTarget: 2,
      },
    ],
  },
  {
    id: "proj-2",
    name: "Exterior Boundary & Facade Upgrade",
    status: "Planning",
    location: "Circuit House Area, Bistupur",
    startDate: "01 Sep 2026",
    targetCompletionDate: "10 Sep 2026",
    budget: 32000,
    spent: 0,
    notes:
      "Monsoon protection requires Apex Ultima Protek Duralife. Selected Steel City Charcoal (8299) for pillars & gates.",
    contractorName: "Sunil Hardware & Painting Team",
    contractorPhone: "+91 98353 11980",
    rooms: [
      {
        roomName: "Front Facade & Boundary Wall",
        wallAreaSqFt: 850,
        selectedShade: DEFAULT_SHADE,
        paintProduct: "Asian Paints Apex Ultima Protek",
        litersRequired: 15,
        litersOrdered: 0,
        coatsDone: 0,
        coatsTarget: 2,
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "⚡ 15% OFF Birla Opus Launch Deal!",
    message:
      "Get flat 15% off on Birla Opus One & Calista ranges. Use code OPUSJAMSHEDPUR at checkout.",
    timestamp: "10 mins ago",
    type: "flash_deal",
    read: false,
    discountCode: "OPUSJAMSHEDPUR",
  },
  {
    id: "notif-2",
    title: "🌧️ Monsoon Dampness Alert for Jamshedpur",
    message:
      "Heavy rain forecasted this week. Protect wall skirting with SmartCare Damp Block 2K before paint bubbling occurs.",
    timestamp: "2 hours ago",
    type: "monsoon_offer",
    read: false,
    discountCode: "MONSOON2026",
  },
  {
    id: "notif-3",
    title: "🎉 150 Rang Coins Credited!",
    message:
      "Thank you for your recent Asian Paints order. Your loyalty coins have been added to your wallet.",
    timestamp: "Yesterday",
    type: "loyalty",
    read: true,
  },
  {
    id: "notif-4",
    title: "🎨 7,000+ New 2026 Shades Added to Sakchi Hub",
    message:
      "Browse full Asian Paints Color Spectra & Birla Opus Palette with instant dispenser mixing!",
    timestamp: "2 days ago",
    type: "shade_launch",
    read: true,
    discountCode: "SHADES7000",
  },
];

export const INITIAL_ORDERS = INITIAL_ORDERS_HISTORY;
export const PUSH_ALERTS_INITIAL = INITIAL_NOTIFICATIONS;
