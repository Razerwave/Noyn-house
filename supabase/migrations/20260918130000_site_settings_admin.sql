alter table public.website_settings enable row level security;

drop policy if exists "process page setting is public" on public.website_settings;
drop policy if exists "public website settings are readable" on public.website_settings;

create policy "public website settings are readable"
on public.website_settings for select
using (key in ('process_page', 'site_settings'));
