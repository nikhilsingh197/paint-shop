import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS_CATALOG } from "../src/data/paintDatabase";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_PUBLISHABLE_KEY in .env",
  );
}

const supabase = createClient(url, key);

const rows = PRODUCTS_CATALOG.map((product) => ({
  id: product.id,
  name: product.name,
  brand: product.brand,
  category: product.category,
  tagline: product.tagline,
  rating: product.rating,
  reviews_count: product.reviewsCount,
  delivery_minutes: product.deliveryMinutes,
  features: product.features,
  coverage_per_liter: product.coveragePerLiter,
  warranty_years: product.warrantyYears ?? null,
  finish: product.finish,
  washability: product.washability,
  image: product.image,
  packs: product.packs,
  requires_shade: product.requiresShade,
  default_shade_code: product.defaultShadeCode ?? null,
  badge: product.badge ?? null,
  is_active: true,
}));

const { error } = await supabase.from("products").upsert(rows, { onConflict: "id" });
if (error) throw error;

console.log(`Seeded ${rows.length} products into Supabase.`);
