import axios from '@/api/http';

export function GetUserInfo() {
  return axios({
    url: '/v1/users/profile',
  });
}

export function GetUserAvatarSrc(uid) {
  return `/v1/users/avatar?uid=${uid}`;
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
