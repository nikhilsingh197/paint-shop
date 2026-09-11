import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bagnstxacdqczjnlwmdr.supabase.co";
const supabaseKey = "sb_publishable_-Roq3VSvZid6OoZTmVZsKw_oOJCZ8og";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  // Let's test a few possible table names that might have been created from CSV
  const tableNames = [
    'painting_leads',
    'leads',
    'service_requests',
    'queries',
    'projects',
    'painting_projects',
    'quotes',
    'customers'
  ];

  for (const table of tableNames) {
    console.log(`Testing table: ${table}...`);
    const { data, error } = await supabase
      .from(table)
      .insert([
        {
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
      console.log(`Error on ${table}:`, error.code, error.message);
    } else {
      console.log(`SUCCESS on ${table}! Data:`, data);
      return;
    }
  }
}

testInsert();
