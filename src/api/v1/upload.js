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
  return axios({
    url: UPLOAD_URL,
    method: 'POST',
    data: { token, offset, file, chunk_hash },
  });
}

export function CancelUpload(token) {
  return axios({
    url: UPLOAD_URL,
    method: 'DELETE',
    data: { token },
  });
}
