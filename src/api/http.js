import axios from 'axios';
import router from '@/router';
import app from '@/App.vue';
import store from '@/store';

const service = axios.create({
  baseURL: '',
  timeout: 60 * 1000,
  withCredentials: true,
});

service.interceptors.request.use(
  config => {
    const authInfo = store.state.authInfo;
    if (authInfo) {
      config.headers['authorization'] = `Bearer ${authInfo.token}`;
    }

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

        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.fullPath },
        });
        app.$toast.error('Login expire, please login again');
        return error;
      }

      return Promise.reject(error.response.data);
    }
    return Promise.reject({ msg: error });
  }
);

export default service;
