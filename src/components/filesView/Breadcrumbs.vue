<template>
  <v-breadcrumbs :items="paths" large class="less-border">
    <template v-slot:item="{ item }">
      <span :class="breadcrumbsClass(item)" @click="breadcrumbsClick(item)">{{item.text}}</span>
    </template>
  </v-breadcrumbs>
</template>

<script>
export default {
  props: ['paths'],

  methods: {
    breadcrumbsClass: function(item) {
      if (item.disabled) return '';
      return 'pointer-cursor clickable-color';
    },

    breadcrumbsClick: function(item) {
      if (item.disabled) return;
      this.$emit('breadcrumbs-click', item);
    },
  },
};
</script>

<style scoped>
.pointer-cursor {
  cursor: pointer;
}

.clickable-color {
  color: #01579b;
}

.less-border {
  padding: 10px !important;
  margin: 0px !important;
}
</style>
