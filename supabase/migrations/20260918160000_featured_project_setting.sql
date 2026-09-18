-- Featured homepage project content is stored in website_settings.value under this key.
-- Public reads are covered by the existing website settings policy.
insert into public.website_settings (key, value)
values ('featured_project', '{}'::jsonb)
on conflict (key) do nothing;

drop policy if exists "public website settings are readable" on public.website_settings;
create policy "public website settings are readable"
on public.website_settings for select
using (key in ('process_page', 'site_settings', 'featured_project'));