-- Supabase Storage: Create resumes bucket
-- Run this if you prefer SQL over UI

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies for resumes bucket
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable public access to resumes bucket (optional)
CREATE POLICY "Public can view resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');
