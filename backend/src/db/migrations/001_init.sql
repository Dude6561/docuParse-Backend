create extension if not exists "pgcrypto";

do $$ begin
  create type document_type as enum ('bank_statement', 'invoice', 'receipt', 'tax_document', 'citizenship', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type job_status as enum ('pending', 'processing', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  external_auth_id text unique,
  email text unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  uploaded_by uuid references app_users(id) on delete set null,
  document_type document_type not null default 'other',
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists processing_jobs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  status job_status not null default 'pending',
  error_message text,
  raw_text text,
  summary jsonb,
  metrics jsonb,
  textract_payload jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists extracted_transactions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references processing_jobs(id) on delete cascade,
  row_index integer not null,
  tx_date text,
  description text,
  debit numeric(18,2),
  credit numeric(18,2),
  balance numeric(18,2),
  confidence numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists extracted_signatures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references processing_jobs(id) on delete cascade,
  page integer,
  confidence numeric(5,2),
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_created_at on documents(created_at desc);
create index if not exists idx_documents_uploaded_by on documents(uploaded_by);
create index if not exists idx_jobs_document on processing_jobs(document_id);
create index if not exists idx_jobs_status_created on processing_jobs(status, created_at desc);
create index if not exists idx_tx_job_row on extracted_transactions(job_id, row_index);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_jobs_updated_at on processing_jobs;
create trigger trg_jobs_updated_at
before update on processing_jobs
for each row
execute function update_updated_at_column();
