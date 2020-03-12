import axios from '@/api/http';

import { DEFAULT_AVATAR } from '@/util/const';

export function GetUserInfo() {
  return axios({
    url: '/v1/users/profile',
  });
}

export function GetUserPublic(uid) {
  return axios({
    url: `/v1/users/public?uid=${uid}`,
  });
}

export function GetUserAvartar(uid) {
  return axios({
    url: `/v1/users/avatar?uid=${uid}`,
    responseType: 'blob',
  }).then(data => {
    if (!data) return DEFAULT_AVATAR;
    return URL.createObjectURL(data);
  });
}

export function UpdateUserInfo({ username, password }) {
  const data = {};
  if (username) data.username = username;
  if (password) data.password = password;
  return axios({
    url: '/v1/users/profile',
    data: { username, password },
    method: 'PUT',
  });
}

export function UploadUserAvatar(avatar) {
  const form = new FormData();
  form.append('avatar', avatar);
  return axios({
    url: '/v1/users/avatar',
    data: form,
    method: 'POST',
  });
}
