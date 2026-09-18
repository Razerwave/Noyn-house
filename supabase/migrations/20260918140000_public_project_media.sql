alter table public.project_media enable row level security;

drop policy if exists "published project media are public" on public.project_media;

create policy "published project media are public"
on public.project_media for select
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_media.project_id
      and projects.status = 'published'
      and projects.deleted_at is null
  )
);
