import { GetUserAvatarSrc } from '@/api/v1/user';

export default {
  updateAuthInfo: function(state) {
    const ls = localStorage.getItem('auth-info');
    state.authInfo = JSON.parse(ls);
  },

  clearAuthInfo: function(state) {
    state.authInfo = null;
  },

  updateAvatar: function(state) {
    state.userAvatar =
      GetUserAvatarSrc(state.authInfo.uid) + `&r=${Math.random()}`;
  },

  setCurrentFolder: function(state, folder_info) {
    state.currentFolder = folder_info;
  },
};
