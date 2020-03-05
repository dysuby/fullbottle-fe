<template>
  <mixin-bar></mixin-bar>
</template>

<script>
export default {
  components: {
    MixinBar: () => import('@/components/nav/MixinBar.vue'),
  },
};
</script>
