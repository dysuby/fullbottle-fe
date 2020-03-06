  
<template>
  <v-app-bar elevate-on-scroll app clipped-left>
    <v-app-bar-nav-icon @click.stop="$emit('appbar-nav-click')"></v-app-bar-nav-icon>

    <v-toolbar-title>FullBottle</v-toolbar-title>

    <v-spacer></v-spacer>
    <v-btn icon large to="/profile">
      <v-avatar size="32px" item>
        <v-img :src="userAvatar" alt="Avatar"></v-img>
      </v-avatar>
    </v-btn>

    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn icon large v-on="on" @click.stop="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </template>
      <span>logout</span>
    </v-tooltip>
  </v-app-bar>
</template>

<script>
import { mapState } from 'vuex';

import { GetUserInfo } from '@/api/v1/user';

export default {
  computed: mapState(['userAvatar']),

  methods: {
    logout: function() {
      this.$store.commit('logout');
      localStorage.removeItem('auth-info');
      this.$router.push('/login');
    },

    fetchProfile: async function() {
      try {
        const resp = await GetUserInfo();
        const data = resp.data.user;
        if (data.avatar_fid) {
          this.$store.commit('updateAvatar');
        }
      } catch (error) {
        this.$toast.error(error.msg);
      }
    },
  },

  created: async function() {
    await this.fetchProfile();
  },
};
</script>
