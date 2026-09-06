-- Nikhil Paints: products table used by GET /api/products
-- Run this in Supabase SQL Editor before seeding the catalog.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null,
  tagline text not null default '',
  rating numeric(3,2) not null default 0,
  reviews_count integer not null default 0,
  delivery_minutes integer not null default 35,
  features jsonb not null default '[]'::jsonb,
  coverage_per_liter text not null default '',
  warranty_years integer,
  finish text not null default 'Matt',
  washability text not null default 'Medium',
  image text not null default '',
  packs jsonb not null default '[]'::jsonb,
  requires_shade boolean not null default false,
  default_shade_code text,
  badge text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_brand_idx on public.products (brand);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_active_idx on public.products (is_active);

-- Public product listing can be read without exposing write access.
alter table public.products enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);
