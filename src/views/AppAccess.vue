<template>
  <centered>
    <keep-alive>
      <component :is="currentFormComponent"></component>
    </keep-alive>
  </centered>
</template>

<script>
export default {
  props: ['action'],

  computed: {
    currentFormComponent: function() {
      return this.action + '-form';
    },
  },

  components: {
    Centered: () => import('@/layouts/Centered.vue'),
    LoginForm: () => import('@/components/appAccess/LoginForm.vue'),
    RegisterForm: () => import('@/components/appAccess/RegisterForm.vue'),
  },
};
</script>
