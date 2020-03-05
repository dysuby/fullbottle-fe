<template>
  <v-container fluid fill-height>
    <v-content>
      <mixin-bar></mixin-bar>
      <centered>
        <profile-content></profile-content>
      </centered>
    </v-content>
  </v-container>
</template>

<script>
export default {
  components: {
    MixinBar: () => import('@/components/nav/MixinBar.vue'),
    Centered: () => import('@/layouts/Centered.vue'),
    ProfileContent: () => import('@/components/profile/ProfileContent.vue'),
  },
};
</script>
