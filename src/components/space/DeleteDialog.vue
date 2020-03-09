<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text class="red--text font-weight-medium">
          <span>This operation is irreversible</span>
          <v-spacer></v-spacer>
          <span v-show="containFolder">(All files under the folder(s) will be deleted)</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="continueClick">Continue</v-btn>
          <v-btn color="black" text @click="cancelClick">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { DeleteFolder, DeleteFile } from '@/api/v1/bottle';
import { ToastError, ToastSuccess } from '@/util/toast';

export default {
  props: ['value', 'entries'],

  computed: {
    title: function() {
      // just determine what to show
      let common = 'Ready to delete ';
      if (this.entries.length === 0) {
        return '';
      } else if (this.entries.length === 1) {
        common += `this ${this.entries[0].type}?`;
      } else {
        let flag = 0;
        for (const e of this.entries) {
          if (e.type === 'file') flag |= 1;
          else flag |= 2;
        }
        const texts = ['files', 'folders', 'entries'];
        common += `these ${texts[flag - 1]}?`;
      }
      return common;
    },

    containFolder: function() {
      return this.entries.some(v => v.type === 'folder');
    },

    dialog: {
      get: function() {
        return this.value;
      },
      set: function(value) {
        this.$emit('input', value);
      },
    },
  },

  methods: {
    continueClick: async function() {
      try {
        const op = [];
        for (const e of this.entries) {
          if (e.type === 'folder') {
            op.push(DeleteFolder(e.id));
          } else {
            op.push(DeleteFile(e.id));
          }
        }
        await Promise.all(op);

        ToastSuccess('Success');

        this.$store.commit('fileChange');
        this.dialog = false;
      } catch (error) {
        ToastError(error);
      }
    },

    cancelClick: function() {
      this.dialog = false;
    },
  },
};
</script>
