<template>
  <centered>
    <share-access></share-access>
  </centered>
</template>

<script>
export default {
  components: {
    Centered: () => import('@/layouts/Centered.vue'),
    ShareAccess: () => import('@/components/share/ShareAccess.vue'),
  },
};
</script>
