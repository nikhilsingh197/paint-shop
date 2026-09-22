const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bagnstxacdqczjnlwmdr.supabase.co", "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og");

async function run() {
  const { data, error } = await supabase.from('shades').select('color_family').eq('color_family', 'General');
  console.log("Count of 'General' family:", data ? data.length : "Error: " + error);
}
run();
