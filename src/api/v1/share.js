import axios from '@/api/http';

export function CreateShare({
  code,
  exp,
  parent_id,
  file_ids,
  folder_ids,
  is_public,
}) {
  return axios({
    url: '/v1/share',
    method: 'POST',
    data: { code, exp, parent_id, file_ids, folder_ids, is_public },
  });
}

export function ModifyShare({ token, code, exp, is_public }) {
  return axios({
    url: `/v1/share/${token}`,
    method: 'PUT',
    data: { code, exp, token, is_public },
  });
}

export function CancelShare(token) {
  return axios({
    url: `/v1/share/${token}`,
    method: 'DELETE',
  });
}

export function RemoveShreEntries({ token, file_ids, folder_ids }) {
  return axios({
    url: `/v1/share/${token}/entries`,
    data: { file_ids, folder_ids, token },
    method: 'DELETE',
  });
}

export function GetShareStatus(token) {
  return axios({
    url: `/v1/share/${token}/status`,
  });
}

export function PostShareAccessToken({ token, code }) {
  return axios({
    url: `/v1/share/${token}/access`,
    method: 'POST',
    data: { token, code },
  });
}

export function GetShareInfo({ token, access_token }) {
  return axios({
    url: `/v1/share/${token}/info?access_token=${access_token}`,
  });
}

export function GetShareEntry({ token, access_token, path }) {
  return axios({
    url: `/v1/share/${token}?access_token=${access_token}&path=${path}`,
  });
}
