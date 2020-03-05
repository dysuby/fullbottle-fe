<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import router from '@/router/index';

export default {
  name: 'App',
  router,
};
</script>
