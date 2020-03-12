import { DEFAULT_AVATAR } from '@/util/const';

export default {
  updateAuthInfo: function(state, authInfo) {
    localStorage.setItem('auth-info', JSON.stringify(authInfo));
    state.authInfo = authInfo;
  },

  logout: function(state) {
    state.authInfo = null;
    state.currentFolder = {};
    state.userAvatar = DEFAULT_AVATAR;
    state.shareAT = {};

    localStorage.clear();
  },

  refreshAvatar: function(state, url) {
    state.userAvatar = url;
  },

  setCurrentFolder: function(state, folder_info) {
    state.currentFolder = folder_info;
  },

  switchUploadDialog: function(state) {
    state.uploadDialog = !state.uploadDialog;
  },

  fileChange: function(state) {
    ++state.fileChange;
  },

  storeShareAT: function(state, payload) {
    localStorage.setItem(payload.token, JSON.stringify(payload.at));
    state.shareAT[payload.token] = payload.at;
  },

  removeShareAT: function(state, token) {
    localStorage.removeItem(token);
    delete state.shareAT[token];
  },
};
