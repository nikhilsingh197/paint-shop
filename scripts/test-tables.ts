import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bagnstxacdqczjnlwmdr.supabase.co";
const supabaseKey = "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  // Since we only have the anon key, we cannot query information_schema directly via postgrest usually,
  // but let's try reading from 'painting_leads', 'service_requests', 'leads', 'quotes', 'painting_requests', 'queries'
  const tables = ['painting_leads', 'service_requests', 'quotes', 'painting_requests', 'queries', 'leads'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (!error) {
      console.log(`Table exists: ${table}`, data);
    } else {
      console.log(`Error for ${table}:`, error.message);
    }
  }
}

checkTables();
