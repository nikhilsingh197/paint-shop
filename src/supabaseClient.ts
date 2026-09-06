import { createClient } from "@supabase/supabase-js";

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = "https://bagnstxacdqczjnlwmdr.supabase.co";
const supabaseKey = "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og";

export const supabase = createClient(supabaseUrl, supabaseKey);
