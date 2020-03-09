<template>
  <v-container>
    <nav-drawer v-model="drawer"></nav-drawer>
    <app-bar @appbar-nav-click="drawer = !drawer"></app-bar>
  </v-container>
</template>

<script>
export default {
  data: function() {
    return {
      drawer: false,
    };
  },
  components: {
    AppBar: () => import('@/components/nav/AppBar.vue'),
    NavDrawer: () => import('@/components/nav/NavDrawer.vue'),
  },
};
</script>
