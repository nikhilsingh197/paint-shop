import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bagnstxacdqczjnlwmdr.supabase.co";
const supabaseKey = "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = [
    'painting_services', 'painting_leads', 'leads', 'queries', 'service_leads',
    'customer_queries', 'painting_requests', 'requests', 'service_requests',
    'quotes', 'painting_quotes', 'customer_leads', 'book_painter', 'bookings',
    'painter_bookings', 'painter_requests'
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("id").limit(1);
    if (!error) {
      console.log(`FOUND TABLE: ${table}`);
      return;
    } else if (error.code !== 'PGRST205') {
      console.log(`FOUND TABLE (but had RLS or other error): ${table}`, error);
      return;
    }
  }
  console.log("No tables matched.");
}

checkTables();
