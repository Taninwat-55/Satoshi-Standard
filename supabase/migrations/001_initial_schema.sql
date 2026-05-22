-- Migration: Initial Schema for Satoshi Standard
-- Creates tables for user profiles, saved items, and price alerts

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- User profiles extending Supabase Auth
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro')),
  stripe_customer_id text unique,
  satoshi_goal bigint default 1000000,
  sats_mode boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User's saved portfolio items
create table if not exists saved_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  currency text not null,
  sats bigint not null,
  category text,
  date_added timestamptz default now(),
  current_sats bigint
);

-- Pro feature: Price alerts
create table if not exists price_alerts (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  target_price_usd numeric not null,
  direction text check (direction in ('above', 'below')) not null,
  is_triggered boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists idx_saved_items_user_id on saved_items(user_id);
create index if not exists idx_saved_items_date_added on saved_items(date_added desc);
create index if not exists idx_price_alerts_user_id on price_alerts(user_id);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table saved_items enable row level security;
alter table price_alerts enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- RLS Policies for saved_items
create policy "Users can view own items"
  on saved_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own items"
  on saved_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on saved_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own items"
  on saved_items for delete
  using (auth.uid() = user_id);

-- RLS Policies for price_alerts
create policy "Users can view own alerts"
  on price_alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert own alerts"
  on price_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alerts"
  on price_alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete own alerts"
  on price_alerts for delete
  using (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles updated_at
drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at_column();
