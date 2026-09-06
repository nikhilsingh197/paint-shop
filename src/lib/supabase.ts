import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🚨 SAFETY NET & DEBUGGING 🚨
// This will print to your browser's Developer Console (F12) so you instantly
// know if Vite successfully "baked" your .env file into the build.
if (!supabaseUrl) {
  console.error(
    "❌ VITE_SUPABASE_URL is missing! Make sure it is in your .env file and you ran 'npm run build'.",
  );
}
if (!supabaseKey) {
  console.error(
    "❌ VITE_SUPABASE_ANON_KEY is missing! Make sure it is in your .env file and you ran 'npm run build'.",
  );
}

// We use fallbacks here so the app doesn't fatally crash the screen,
// allowing you to still see the console errors if the keys are missing.
export const supabase = createClient(
  supabaseUrl || "https://missing-url.supabase.co",
  supabaseKey || "missing-key",
);
