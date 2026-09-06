import { supabase } from "./supabase";
import { ProductItem } from "../types";
import { PRODUCTS_CATALOG } from "../data/paintDatabase";

export async function fetchProducts(): Promise<ProductItem[]> {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Supabase product fetch error:", error.message);
      return PRODUCTS_CATALOG; // Fallback to offline catalog if table is empty/missing
    }

    if (!data || data.length === 0) {
      return PRODUCTS_CATALOG;
    }

    // Map database rows to match your ProductItem interface if needed
    return data as ProductItem[];
  } catch (err) {
    console.error("Network or client error fetching products:", err);
    return PRODUCTS_CATALOG; // Graceful fallback
  }
}
