<template>
  <v-container fluid grid-list-xl>
    <v-content>
      <mixin-bar></mixin-bar>
      <uploader></uploader>
      <router-view></router-view>
    </v-content>
  </v-container>
</template>

<script>
export default {
  components: {
    MixinBar: () => import('@/components/nav/MixinBar.vue'),
    Uploader: () => import('@/components/upload/Uploader.vue'),
  },
};
</script>
