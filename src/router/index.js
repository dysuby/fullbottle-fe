import Vue from 'vue';
import VueRouter from 'vue-router';

import store from '@/store';
import { Now, FromUnixSeconds } from '@/util/day';
import { ToastError, ToastSuccess } from '@/util/toast';

const AppAccess = () => import('@/views/AppAccess.vue');
const HomeView = () => import('@/views/HomeView.vue');
const SpaceView = () => import('@/views/SpaceView.vue');
const UserProfile = () => import('@/views/UserProfile.vue');
const ShareAccess = () => import('@/views/ShareAccess.vue');
const ShareView = () => import('@/views/ShareView.vue');

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    component: HomeView,
    children: [
      {
        name: 'profile',
        path: 'profile',
        component: UserProfile,
        meta: { requiresAuth: true, requiresNoLogin: false },
      },
      {
        name: 'space',
        path: 'space/:fid?',
        component: SpaceView,
        meta: { requiresAuth: true, requiresNoLogin: false },
      },
      {
        path: '',
        component: SpaceView,
        meta: { requiresAuth: true, requiresNoLogin: false },
      },
    ],
  },
  {
    name: 'login',
    path: '/login',
    component: AppAccess,
    props: { action: 'login' },
    meta: { requiresAuth: false, requiresNoLogin: true },
  },
  {
    name: 'register',
    path: '/register',
    component: AppAccess,
    props: { action: 'register' },
    meta: { requiresAuth: false, requiresNoLogin: true },
  },
  {
    name: 'shareAccess',
    path: '/share/:token',
    component: ShareAccess,
    meta: { requiresAuth: true, requiresNoLogin: false },
  },
  {
    name: 'shareView',
    path: '/share/:token/view/:path?',
    component: ShareView,
    meta: { requiresAuth: true, requiresNoLogin: false },
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  const authInfo = store.state.authInfo;
  const needLogin = () =>
    !authInfo || Now().isAfter(FromUnixSeconds(authInfo.expire));

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // no login info or login expire
    if (needLogin()) {
      if (authInfo) {
        localStorage.clear();
        store.commit('logout');
      }
      ToastError('Please login to continue');
      return next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
    }
  } else if (
    to.matched.some(record => record.meta.requiresNoLogin) &&
    !needLogin()
  ) {
    ToastSuccess('Already login, redirecting...');
    return next({
      path: to.query.redirect || '/home',
    });
  }
  next();
});

export default router;
