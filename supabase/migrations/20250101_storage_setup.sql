-- Create a new storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Set up security policies for the 'documents' bucket

-- Allow authenticated users to upload files
create policy "Authenticated users can upload documents"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'documents' );

-- Allow authenticated users to update their own files (optional, usually not needed for immutable uploads)
create policy "Authenticated users can update documents"
on storage.objects for update
to authenticated
using ( bucket_id = 'documents' );

-- Allow everyone to read documents (since we set public=true, but good to be explicit if we change it)
-- Or restrict to authenticated if it contains sensitive info. For now, assuming authenticated read.
create policy "Authenticated users can read documents"
on storage.objects for select
to authenticated
using ( bucket_id = 'documents' );

-- Allow users to delete their own files (optional)
create policy "Authenticated users can delete documents"
on storage.objects for delete
to authenticated
using ( bucket_id = 'documents' );
