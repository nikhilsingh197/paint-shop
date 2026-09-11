import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bagnstxacdqczjnlwmdr.supabase.co";
const supabaseKey = "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from("leads").select("*").limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
