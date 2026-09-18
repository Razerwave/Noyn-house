create extension if not exists "pgcrypto";

create type enquiry_status as enum ('Шинэ','Холбогдсон','Мэдээлэл дутуу','Уулзалт товлосон','Талбай үзсэн','Үнийн санал бэлтгэж байгаа','Үнийн санал илгээсэн','Гэрээний шатанд','Гэрээ болсон','Цуцлагдсан','Архивласан');

create table public.roles (id uuid primary key default gen_random_uuid(), name text unique not null, permissions jsonb not null default '[]', created_at timestamptz default now(), updated_at timestamptz default now());
create table public.profiles (id uuid primary key references auth.users on delete cascade, full_name text, role_id uuid references public.roles, created_at timestamptz default now(), updated_at timestamptz default now());
insert into public.roles (name) values ('Admin'), ('Content Editor'), ('Sales') on conflict (name) do nothing;
create table public.house_models (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, category text, cover_image text, total_area numeric, floors int, rooms int, bedrooms int, bathrooms int, dimensions text, short_description text, construction_duration text, materials jsonb default '[]', included_services jsonb default '[]', excluded_services jsonb default '[]', additional_options jsonb default '[]', pdf_url text, price_status text default 'Төслийн нөхцөлөөс хамаарч үнэ тооцно.', featured boolean default false, status text default 'draft', display_order int default 0, created_by uuid references public.profiles, updated_by uuid references public.profiles, deleted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.house_model_media (id uuid primary key default gen_random_uuid(), model_id uuid references public.house_models on delete cascade, media_type text check(media_type in ('exterior','interior','floor_plan')), url text not null, alt_text text, display_order int default 0, created_at timestamptz default now());
create table public.projects (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, general_location text, total_area numeric, house_model_id uuid references public.house_models, duration text, completion_year int, status text default 'draft', overview text, materials jsonb default '[]', completed_work jsonb default '[]', approved_review text, created_by uuid references public.profiles, updated_by uuid references public.profiles, deleted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.project_media (id uuid primary key default gen_random_uuid(), project_id uuid references public.projects on delete cascade, media_type text check(media_type in ('cover','gallery','before','after','progress')), url text not null, alt_text text, display_order int default 0, created_at timestamptz default now());
create table public.project_stages (id uuid primary key default gen_random_uuid(), project_id uuid references public.projects on delete cascade, title text not null, description text, stage_date date, display_order int default 0, created_at timestamptz default now());
create table public.services (id uuid primary key default gen_random_uuid(), title text not null, description text, status text default 'draft', display_order int default 0, created_by uuid references public.profiles, updated_by uuid references public.profiles, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.technology_sections (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, content jsonb not null default '{}', technical_values jsonb not null default '{}', status text default 'draft', display_order int default 0, updated_by uuid references public.profiles, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.process_steps (id uuid primary key default gen_random_uuid(), title text not null, description text, display_order int default 0, status text default 'published', updated_by uuid references public.profiles, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.quotation_enquiries (id uuid primary key default gen_random_uuid(), enquiry_number text unique not null, customer_name text not null, phone text not null, email text, location text not null, interested_model text, budget text, assigned_to uuid references public.profiles, next_follow_up_at timestamptz, status enquiry_status default 'Шинэ', source_page text, consent_at timestamptz not null, form_data jsonb not null default '{}', deleted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create index quotation_enquiries_status_idx on public.quotation_enquiries(status);create index quotation_enquiries_created_idx on public.quotation_enquiries(created_at desc);
create table public.enquiry_attachments (id uuid primary key default gen_random_uuid(), enquiry_id uuid references public.quotation_enquiries on delete cascade, file_url text not null, file_name text not null, mime_type text, size_bytes bigint, created_at timestamptz default now());
create table public.enquiry_notes (id uuid primary key default gen_random_uuid(), enquiry_id uuid references public.quotation_enquiries on delete cascade, note text not null, author_id uuid references public.profiles, created_at timestamptz default now());
create table public.enquiry_history (id uuid primary key default gen_random_uuid(), enquiry_id uuid references public.quotation_enquiries on delete cascade, from_status enquiry_status, to_status enquiry_status, changed_by uuid references public.profiles, created_at timestamptz default now());
create table public.follow_up_activities (id uuid primary key default gen_random_uuid(), enquiry_id uuid references public.quotation_enquiries on delete cascade, activity_type text not null, notes text, scheduled_at timestamptz, completed_at timestamptz, created_by uuid references public.profiles, created_at timestamptz default now());
create table public.article_categories (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, display_order int default 0);
create table public.articles (id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, cover_image text, category_id uuid references public.article_categories, summary text, content jsonb default '{}', author_id uuid references public.profiles, published_at timestamptz, status text default 'draft', seo jsonb default '{}', deleted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.faq_categories (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, display_order int default 0);
create table public.faqs (id uuid primary key default gen_random_uuid(), category_id uuid references public.faq_categories, question text not null, answer text not null, status text default 'draft', display_order int default 0, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.media_files (id uuid primary key default gen_random_uuid(), url text not null, file_name text not null, mime_type text not null, size_bytes bigint not null, alt_text text, uploaded_by uuid references public.profiles, created_at timestamptz default now());
create table public.website_settings (key text primary key, value jsonb not null, updated_by uuid references public.profiles, updated_at timestamptz default now());
create table public.activity_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references public.profiles, action text not null, entity_type text, entity_id uuid, before_data jsonb, after_data jsonb, ip inet, created_at timestamptz default now());

alter table public.quotation_enquiries enable row level security;alter table public.house_models enable row level security;alter table public.projects enable row level security;alter table public.articles enable row level security;alter table public.process_steps enable row level security;alter table public.website_settings enable row level security;
create or replace function public.has_role(allowed_roles text[]) returns boolean language sql security definer set search_path=public stable as $$ select exists(select 1 from public.profiles p join public.roles r on r.id=p.role_id where p.id=auth.uid() and r.name=any(allowed_roles)); $$;
revoke all on function public.has_role(text[]) from public;grant execute on function public.has_role(text[]) to authenticated;
create policy "published models are public" on public.house_models for select using(status='published' and deleted_at is null);
create policy "published projects are public" on public.projects for select using(status='published' and deleted_at is null);
create policy "published articles are public" on public.articles for select using(status='published' and deleted_at is null);
create policy "sales manage enquiries" on public.quotation_enquiries for all to authenticated using(public.has_role(array['Admin','Sales'])) with check(public.has_role(array['Admin','Sales']));
create policy "editors manage models" on public.house_models for all to authenticated using(public.has_role(array['Admin','Content Editor'])) with check(public.has_role(array['Admin','Content Editor']));
create policy "editors manage projects" on public.projects for all to authenticated using(public.has_role(array['Admin','Content Editor'])) with check(public.has_role(array['Admin','Content Editor']));
create policy "editors manage articles" on public.articles for all to authenticated using(public.has_role(array['Admin','Content Editor'])) with check(public.has_role(array['Admin','Content Editor']));
create policy "published process steps are public" on public.process_steps for select using(status='published');
create policy "process page setting is public" on public.website_settings for select using(key='process_page');
create policy "editors manage process steps" on public.process_steps for all to authenticated using(public.has_role(array['Admin','Content Editor'])) with check(public.has_role(array['Admin','Content Editor']));
create policy "editors manage website settings" on public.website_settings for all to authenticated using(public.has_role(array['Admin','Content Editor'])) with check(public.has_role(array['Admin','Content Editor']));
-- Public quotation inserts use the server-only service role after Zod validation and rate limiting.

-- Project images are uploaded only by the authenticated admin API using the service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('house-images', 'house-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
