  
<template>
  <v-app-bar elevate-on-scroll app clipped-left>
    <v-app-bar-nav-icon @click.stop="$emit('appbar-nav-click')"></v-app-bar-nav-icon>

    <v-toolbar-title>FullBottle</v-toolbar-title>

    <v-spacer></v-spacer>
    <v-btn icon large>
      <!-- TODO -->
      <v-avatar size="32px" item>
        <v-img :src="userAvatar" alt="Avatar"></v-img>
      </v-avatar>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: mapState(['userAvatar']),
};
</script>
