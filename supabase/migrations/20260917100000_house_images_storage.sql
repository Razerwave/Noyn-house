-- Public reads support house model pages; all writes go through the server-side admin API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('house-images', 'house-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
