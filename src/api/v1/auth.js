import axios from '@/api/http';

export function Login({ email, password }) {
  return axios({
    url: '/v1/login',
    data: { email, password },
    method: 'POST',
  });
}

export function Register({ email, username, password }) {
  return axios({
    url: '/v1/register',
    data: { email, username, password },
    method: 'POST',
  });
}
