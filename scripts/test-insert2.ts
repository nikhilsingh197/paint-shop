import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bagnstxacdqczjnlwmdr.supabase.co";
const supabaseKey = "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase
    .from('painting_leads')
    .insert([
      {
        user_id: 'd33b3719-983d-4f2b-8e10-0eb43bd87f1d',
        full_name: "Test User",
        phone: "1234567890",
        property_type: "Residential",
        service_type: "Full House Painting",
        address: "123 Test St",
        preferred_date: "2026-09-10",
        status: "Pending"
      }
    ])
    .select();

  if (error) {
    console.log(`Error:`, error.code, error.message);
  } else {
    console.log(`SUCCESS Data:`, data);
  }
}

testInsert();
