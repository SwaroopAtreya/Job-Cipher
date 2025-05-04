
-- Create a storage bucket for resumes if it doesn't exist
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Create a policy to allow authenticated users to upload resumes
create policy "Allow authenticated users to upload resumes"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create a policy to allow authenticated users to read their own resumes
create policy "Allow authenticated users to read their own resumes"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
