import { DEFAULT_AVATAR } from '@/util/const';

export default {
  authInfo:
    'auth-info' in localStorage
      ? JSON.parse(localStorage.getItem('auth-info'))
      : null,

  userAvatar: DEFAULT_AVATAR,

  currentFolder: {},

  uploadDialog: false,

  fileChange: 0, // value means nothing
};
