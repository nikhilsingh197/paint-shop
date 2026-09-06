-- Safe migration for an existing Nikhil Paints products table.
-- Run this in Supabase SQL Editor if your table already exists.

alter table public.products
  add column if not exists is_active boolean not null default true;

create index if not exists products_active_idx
  on public.products (is_active);

-- Enable RLS and allow public reads of active products.
alter table public.products enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);
