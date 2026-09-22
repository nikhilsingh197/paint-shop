const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bagnstxacdqczjnlwmdr.supabase.co", "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og");

async function run() {
  const { data, error } = await supabase.from('shades').upsert({
    brand_name: 'Asian Paints',
    color_family: 'off whites',
    shade_name: 'air breeze',
    shade_code: '9436',
    hex_code: '#F3EDE8',
    tinting_charge: 2.0
  });
  console.log("Upsert Error:", error);
}
run();
