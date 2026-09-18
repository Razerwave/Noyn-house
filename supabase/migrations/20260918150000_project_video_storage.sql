-- Project videos share the project media table and public storage bucket.
alter table public.project_media drop constraint if exists project_media_media_type_check;
alter table public.project_media add constraint project_media_media_type_check
  check (media_type in ('cover', 'gallery', 'before', 'after', 'progress', 'video'));

update storage.buckets
set file_size_limit = 104857600,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','video/quicktime']
where id = 'project-images';
