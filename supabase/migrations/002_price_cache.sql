-- Migration: Price Cache Table
-- Stores cached BTC prices to reduce API calls

create table if not exists price_cache (
  currency text primary key,
  btc_price numeric not null,
  fetched_at timestamptz default now() not null
);

-- Create index for faster TTL queries
create index if not exists idx_price_cache_fetched_at on price_cache(fetched_at);

-- Function to clean old cache entries (older than 5 minutes)
create or replace function public.clean_price_cache()
returns void as $$
begin
  delete from price_cache where fetched_at < now() - interval '5 minutes';
end;
$$ language plpgsql;
