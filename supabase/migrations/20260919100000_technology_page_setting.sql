insert into public.website_settings (key, value)
values ('technology_page', '{}'::jsonb)
on conflict (key) do nothing;

drop policy if exists "public website settings are readable" on public.website_settings;
create policy "public website settings are readable"
on public.website_settings for select
using (key in ('process_page', 'site_settings', 'featured_project', 'technology_page'));