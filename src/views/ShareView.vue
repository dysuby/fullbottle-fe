<template>
  <v-container fluid grid-list-xl>
    <v-content>
      <mixin-bar></mixin-bar>
      <share-content></share-content>
    </v-content>
  </v-container>
</template>

<script>
export default {
  components: {
    MixinBar: () => import('@/components/nav/MixinBar.vue'),
    ShareContent: () => import('@/components/share/ShareContent.vue'),
  },
};
</script>

