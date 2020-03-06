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
