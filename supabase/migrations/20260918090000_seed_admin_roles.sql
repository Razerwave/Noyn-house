insert into public.roles (name)
values ('Admin'), ('Content Editor'), ('Sales')
on conflict (name) do nothing;
