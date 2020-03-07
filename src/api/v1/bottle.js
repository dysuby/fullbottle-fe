import axios from '@/api/http';

export const VIRTUAL_ROOT = -1;

export function GetSpaceMeta() {
  return axios({
    url: '/v1/space/meta',
  });
}

export function GetFilesByFolderId(fid) {
  if (!fid) fid = VIRTUAL_ROOT;

  return axios({
    url: `/v1/space/folders?folder_id=${fid}`,
  });
}

export function GetFilesByPath(path) {
  if (!path) path = '/';

  return axios({
    url: `/v1/space/folders?path=${path}`,
  });
}

export function GetFolderParents(fid) {
  if (!fid) fid = VIRTUAL_ROOT;
  return axios({
    url: `/v1/space/folders/parents?folder_id=${fid}`,
  });
}

export function CreateFolder({ name, parent_id }) {
  return axios({
    url: `/v1/space/folders`,
    data: { name, parent_id },
    method: 'POST',
  });
}

export function UpdateFolder({ folder_id, name, parent_id }) {
  return axios({
    url: `/v1/space/folders`,
    data: { folder_id, name, parent_id },
    method: 'PUT',
  });
}

export function UpdateFile({ file_id, name, folder_id }) {
  return axios({
    url: `/v1/space/files`,
    data: { file_id, name, folder_id },
    method: 'PUT',
  });
}

export function DeleteFolder(fid) {
  if (!fid) return Promise.reject({ msg: 'fid undefined' });

  return axios({
    url: `/v1/space/folders`,
    data: { folder_id: fid },
    method: 'DELETE',
  });
}

export function Deletefile(fid) {
  if (!fid) return Promise.reject({ msg: 'fid undefined' });

  return axios({
    url: `/v1/space/files`,
    data: { file_id: fid },
    method: 'DELETE',
  });
}
