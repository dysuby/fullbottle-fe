export default {
  uid: state => (state.authInfo ? state.authInfo.uid : 0),

  shareAT: function(state) {
    return token => {
      if (!state.shareAT[token]) {
        const raw = localStorage.getItem(token);
        if (!raw) return;
        state.shareAT[token] = JSON.parse(raw);
      }
      return state.shareAT[token];
    };
  },
};
