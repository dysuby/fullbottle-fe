export default {
  authInfo:
    'auth-info' in localStorage
      ? JSON.parse(localStorage.getItem('auth-info'))
      : null,

  userAvatar: '/default.png', // TODO default avatar

  currentFolder: {},
};
