-- Run this in your Supabase SQL Editor
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;
