// Minimal media helper with future-proof API for Supabase Storage integration
// For now, it simply echoes back the provided URI and infers media type by extension.

export type MediaUploadResult = {
  url: string;
  type: 'photo' | 'video';
};

export function detectMediaType(uri: string): 'photo' | 'video' {
  const lower = (uri || '').toLowerCase();
  if (/\.(mp4|mov|m4v|webm)$/.test(lower)) return 'video';
  return 'photo';
}

export async function uploadServiceMedia(uri: string): Promise<MediaUploadResult> {
  // TODO: Replace with Supabase Storage upload and return signed URL
  return {
    url: uri,
    type: detectMediaType(uri),
  };
}


