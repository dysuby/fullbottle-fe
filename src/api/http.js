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
    return response.data;
  },
  error => {
    if (axios.isCancel(error)) {
      return;
    }

    if (error.response) {
      const resp = error.response;

      // token invalid
      if (resp.status === 401) {
        localStorage.clear();
        store.commit('logout');

        ToastError('Login expire, please login again');
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.fullPath },
        });
        return Promise.reject(error);
      }

      if (
        error.request.responseType === 'blob' &&
        resp.data instanceof Blob &&
        resp.data.type &&
        resp.data.type.toLowerCase().indexOf('json') != -1
      ) {
        return new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.onload = () => {
            resp.data = JSON.parse(reader.result);
            resolve(Promise.reject(resp.data));
          };

          reader.onerror = () => {
            reject(error);
          };

          reader.readAsText(resp.data);
        });
      }

      return Promise.reject(resp.data);
    }
    return Promise.reject({ msg: error });
  }
);

export default service;
