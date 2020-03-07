<template>
  <centered>
    <profile-content></profile-content>
  </centered>
</template>

<script>
export default {
  components: {
    Centered: () => import('@/layouts/Centered.vue'),
    ProfileContent: () => import('@/components/profile/ProfileContent.vue'),
  },
};
</script>
