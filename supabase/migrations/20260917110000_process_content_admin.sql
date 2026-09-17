alter table public.process_steps enable row level security;
alter table public.website_settings enable row level security;

drop policy if exists "published process steps are public" on public.process_steps;
create policy "published process steps are public"
on public.process_steps for select
using (status = 'published');

drop policy if exists "process page setting is public" on public.website_settings;
create policy "process page setting is public"
on public.website_settings for select
using (key = 'process_page');

drop policy if exists "editors manage process steps" on public.process_steps;
create policy "editors manage process steps"
on public.process_steps for all to authenticated
using (public.has_role(array['Admin','Content Editor']))
with check (public.has_role(array['Admin','Content Editor']));

drop policy if exists "editors manage website settings" on public.website_settings;
create policy "editors manage website settings"
on public.website_settings for all to authenticated
using (public.has_role(array['Admin','Content Editor']))
with check (public.has_role(array['Admin','Content Editor']));
