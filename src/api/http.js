import axios from 'axios';
import router from '@/router';
import app from '@/App.vue';
import store from '@/store';

const service = axios.create({
  baseURL: '',
  timeout: 60 * 1000,
  withCredentials: true,
});

const queue = [];
const cancelToken = axios.CancelToken;
const requestUrl = config => `${config.url}_${config.method}`;

const removeQueue = config => {
  queue.forEach((item, index) => {
    if (item.requestUrl === requestUrl(config)) {
      item.cancel();
      queue.splice(index, 1);
    }
  });
};

service.interceptors.request.use(
  config => {
    // 中断重复请求
    removeQueue(config);
    config.cancelToken = new cancelToken(c => {
      queue.push({
        requestUrl: requestUrl(config),
        cancel: c,
      });
    });

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
    // 请求完成后从队列中删除
    removeQueue(response.config);
    return response;
  },
  error => {
    if (error.response) {
      // token invalid
      if (error.response.status === 401) {
        localStorage.clear();
        store.commit('clearAuthInfo');

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
