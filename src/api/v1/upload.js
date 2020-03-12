import axios from '@/api/http';

export const UPLOAD_URL = '/v1/space/upload/file';

export function GetUploadToken({ folder_id, filename, mime, hash, size }) {
  return axios({
    url: '/v1/space/upload/token',
    method: 'POST',
    data: { folder_id, filename, mime, hash, size },
  });
}

/**
 * fake upload, ask server to create file link when file meta exist
 */
export function UploadFile({ token, offset, chunk_hash, file }) {
  const form = new FormData();
  form.set('token', token);
  form.set('offset', offset);
  form.set('file', file || new Blob());
  form.set('chunk_hash', chunk_hash);
  return axios({
    url: UPLOAD_URL,
    method: 'POST',
    data: form,
  });
}

export function CancelUpload(token) {
  return axios({
    url: UPLOAD_URL,
    method: 'DELETE',
    data: { token },
  });
}
