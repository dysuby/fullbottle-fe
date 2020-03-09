<template>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="entries"
    :loading="loading"
    loading-text="loading..."
    item-key="key"
    show-select
    disable-pagination
    disable-sort
    hide-default-footer
    fixed-header
  >
    <template v-slot:top>
      <slot name="top"></slot>
    </template>

    <template v-slot:item.icon="{ item }">
      <v-icon>{{ getIcon(item.type) }}</v-icon>
    </template>

    <template v-slot:item.name="{ item }">
      <span class="clickable-hover-color pointer-cursor" @click="entryClick(item)">{{item.name}}</span>
    </template>

    <template v-slot:item.update_time="{ item }">{{ formatDate(item.update_time) }}</template>

    <template v-slot:item.size="{ item }">{{ formatSize(item.size) }}</template>

    <template v-slot:item.action="{ item }">
      <slot name="itemAction" :item="item"></slot>
    </template>
    <template v-slot:no-data>You have no files here</template>
  </v-data-table>
</template>

<script>
import { FromUnixSeconds } from '@/util/day';
import { SizeUnitConv } from '@/util/file';

export default {
  props: ['files', 'folders', 'loading'],

  data: function() {
    return {
      selected: [],
      headers: [
        {
          text: '',
          value: 'icon',
          width: '16px',
        },
        {
          text: 'Name',
          value: 'name',
        },
        { text: 'Size', value: 'size' },
        { text: 'Update Date', value: 'update_time' },
        { text: 'Action', value: 'action' },
      ],
    };
  },

  computed: {
    entries: function() {
      // to view data
      const folder = this.folders
        ? this.folders.map(v => ({
            ...v,
            type: 'folder',
            key: `folder:${v.id}`,
          }))
        : [];
      const files = this.files
        ? this.files.map(v => ({ ...v, type: 'file', key: `file:${v.id}` }))
        : [];

      return [...folder, ...files];
    },
  },

  methods: {
    entryClick: function(item) {
      return this.$emit(`${item.type}-click`, item);
    },

    formatDate: function(seconds) {
      return FromUnixSeconds(seconds).format('YYYY-MM-DD HH:mm:ss');
    },

    formatSize: function(size) {
      if (!size) return '-';
      const f = SizeUnitConv(size);
      return `${f.value}${f.unit}`;
    },

    getIcon: function(type) {
      if (type === 'folder') return 'mdi-folder';
      return 'mdi-file';
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

.clickable-hover-color:hover {
  color: #03a9f4;
}

.less-border {
  padding: 10px !important;
  margin: 0px !important;
}
</style>