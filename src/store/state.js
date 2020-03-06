export default {
  authInfo:
    'auth-info' in localStorage
      ? JSON.parse(localStorage.getItem('auth-info'))
      : null,
  userAvatar: 'https://cdn.vuetifyjs.com/images/logos/logo.svg', // TODO default avatar

  currentFolder: {},
};
