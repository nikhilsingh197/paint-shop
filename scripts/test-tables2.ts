import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bagnstxacdqczjnlwmdr.supabase.co";
const supabaseKey = "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['bookings', 'requests', 'appointments', 'services', 'customer_leads', 'painting_services', 'painting_quotes', 'customer_queries'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (!error) {
      console.log(`Table exists: ${table}`);
      return;
    }
  }
}

checkTables();
