<template>
  <v-navigation-drawer v-model="drawerOn" app clipped>
    <v-list nav>
      <v-list-item-group color="primary">
        <v-list-item link to="/home/space">
          <v-list-item-icon>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Space</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/home/profile">
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-divider></v-divider>

    <v-card flat>
      <v-card-title class="subtitle-2">{{sizeString(used)}}/{{sizeString(capacity)}} Used</v-card-title>
      <v-card-text>
        <v-progress-linear :value="spaceCapacity" height="7px" rounded></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex';

import { GetSpaceMeta } from '@/api/v1/bottle';
import { SizeUnitConv } from '@/util/file';
import { ToastError } from '@/util/toast';

export default {
  props: ['drawer'],

  model: {
    prop: 'drawer',
    event: 'input',
  },

  data: function() {
    return {
      capacity: 0,
      remain: 0,
    };
  },

  created: async function() {
    await this.fetchMeta();
  },

  computed: {
    drawerOn: {
      get: function() {
        return this.drawer;
      },
      set: function(value) {
        this.$emit('input', value);
      },
    },

    used: function() {
      return this.capacity - this.remain;
    },

    spaceCapacity: function() {
      return (this.used / this.capacity) * 100;
    },

    ...mapState(['fileChange']),
  },

  watch: {
    fileChange: 'fetchMeta',
  },

  methods: {
    fetchMeta: async function() {
      try {
        const data = await GetSpaceMeta();
        const meta = data.result;
        this.capacity = meta.capacity;
        this.remain = meta.remain;
      } catch (error) {
        ToastError(error);
      }
    },

    sizeString: function(s) {
      const conv = SizeUnitConv(s);
      return `${conv.value}${conv.unit}`;
    },
  },
};
</script>
