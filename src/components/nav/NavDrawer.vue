<template>
  <v-navigation-drawer v-model="drawerOn" app clipped>
    <v-list nav>
      <v-list-item-group color="primary">
        <v-list-item link to="/space">
          <v-list-item-icon>
            <v-icon>mdi-folder</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Space</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/profile">
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-divider></v-divider>

    <v-card flat>
      <v-card-title class="subtitle-2">剩余容量 {{sizeString(remain)}}/{{sizeString(capacity)}}</v-card-title>
      <v-card-text>
        <v-progress-linear :value="spaceCapacity" height="7px" rounded></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import { GetSpaceMeta } from '@/api/v1/bottle';
import { SizeUnitConv } from '@/util/file';

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

    spaceCapacity: function() {
      return (this.remain / this.capacity) * 100;
    },
  },

  methods: {
    fetchMeta: async function() {
      try {
        const resp = await GetSpaceMeta();
        const meta = resp.data.meta;
        this.capacity = meta.capacity;
        this.remain = meta.remain;
      } catch (error) {
        this.$toast.error(error.msg);
      }
    },

    sizeString: function(s) {
      const conv = SizeUnitConv(s);
      return `${conv.value}${conv.unit}`;
    },
  },
};
</script>
