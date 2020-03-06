import Vue from 'vue';
import VueRouter from 'vue-router';

import store from '@/store';
import { Now, FromUnixSeconds } from '@/util/day';

const AppAccess = () => import('@/views/AppAccess.vue');
const SpaceView = () => import('@/views/SpaceView.vue');
const UserProfile = () => import('@/views/UserProfile.vue');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/space',
  },
  {
    name: 'login',
    path: '/login',
    component: AppAccess,
    props: { action: 'login' },
    meta: { requiresAuth: false },
  },
  {
    name: 'register',
    path: '/register',
    component: AppAccess,
    props: { action: 'register' },
    meta: { requiresAuth: false },
  },
  {
    name: 'space',
    path: '/space/:fid?',
    component: SpaceView,
    meta: { requiresAuth: true },
  },
  {
    name: 'profile',
    path: '/profile',
    component: UserProfile,
    meta: { requiresAuth: true },
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  const authInfo = store.state.authInfo;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // no login info or login expire
    if (!authInfo || Now().isAfter(FromUnixSeconds(authInfo.expire))) {
      if (authInfo) {
        localStorage.clear();
        store.commit('clearAuthInfo');
      }
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }
  } else if (authInfo) {
    next({
      path: '/',
    });
    return;
  }
  next();
});

export default router;
