const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function getPublicStorageUrl(bucket: string, path: string) {
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
