-- Private file storage for user-owned health record attachments.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'health-record-attachments',
  'health-record-attachments',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Users can view own health record attachments"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'health-record-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own health record attachments"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'health-record-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own health record attachments"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'health-record-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'health-record-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own health record attachments"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'health-record-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
