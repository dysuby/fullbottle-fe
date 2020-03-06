<template>
  <v-container fluid grid-list-xl>
    <v-content>
      <mixin-bar></mixin-bar>
      <space-content></space-content>
    </v-content>
  </v-container>
</template>

<script>
export default {
  components: {
    MixinBar: () => import('@/components/nav/MixinBar.vue'),
    SpaceContent: () => import('@/components/space/SpaceContent.vue'),
  },
};
</script>
