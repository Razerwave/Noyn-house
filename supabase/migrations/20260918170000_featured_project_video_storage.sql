-- Dedicated storage for the homepage featured project videos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'featured-project-videos',
  'featured-project-videos',
  true,
  104857600,
  array['video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;