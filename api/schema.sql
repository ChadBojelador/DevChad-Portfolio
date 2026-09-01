-- Run in the Supabase SQL editor before ingesting the portfolio knowledge base.
create extension if not exists vector with schema extensions;

create table if not exists public.portfolio_knowledge (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  type text not null,
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_knowledge_embedding_idx
  on public.portfolio_knowledge using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 50);

create or replace function public.match_portfolio_knowledge(
  query_embedding extensions.vector(1536),
  match_threshold float,
  match_count int
)
returns table (id uuid, type text, title text, content text, metadata jsonb, similarity float)
language sql stable
as $$
  select id, type, title, content, metadata, 1 - (embedding <=> query_embedding) as similarity
  from public.portfolio_knowledge
  where 1 - (embedding <=> query_embedding) >= match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- The browser never reads this table; only the backend uses a service-role key.
alter table public.portfolio_knowledge enable row level security;
revoke all on public.portfolio_knowledge from anon, authenticated;
grant execute on function public.match_portfolio_knowledge(extensions.vector, float, int) to service_role;
