-- Create storage bucket for exam results
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exam-results',
  'exam-results',
  false,
  10485760, -- 10MB
  array['application/pdf']
);

-- Allow service role to upload (via API routes)
create policy "Service role can upload exam results"
  on storage.objects for insert
  with check (bucket_id = 'exam-results');

-- Allow authenticated staff to read files
create policy "Staff can read exam results"
  on storage.objects for select
  using (
    bucket_id = 'exam-results'
    and auth.role() = 'authenticated'
  );
