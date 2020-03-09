import Vue from 'vue';

export function ToastError(error) {
  Vue.prototype.$toast.error(error.msg || error);
}

export function ToastSuccess(msg) {
  Vue.prototype.$toast.success(msg);
}
