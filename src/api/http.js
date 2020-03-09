import axios from 'axios';
import router from '@/router';
import store from '@/store';
import { ToastError } from '@/util/toast';

const service = axios.create({
  baseURL: '',
  timeout: 60 * 1000,
  withCredentials: true,
});

service.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (axios.isCancel(error)) {
      return;
    }

    if (error.response) {
      // token invalid
      if (error.response.status === 401) {
        localStorage.clear();
        store.commit('logout');

        ToastError('Login expire, please login again');
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.fullPath },
        });
        return error;
      }

      return Promise.reject(error.response.data);
    }
    return Promise.reject({ msg: error });
  }
);

export default service;
