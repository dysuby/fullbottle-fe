<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title>Ready to delete this {{entry.type}}?</v-card-title>
        <v-card-text class="red--text font-weight-medium">
          <span>This operation is irreversible</span>
          <v-spacer></v-spacer>
          <span v-show="entry.type === 'folder'">(All files under this folder will be deleted)</span>
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
  props: ['value', 'entry'],

  computed: {
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
        if (this.entry.type === 'folder') {
          await DeleteFolder(this.entry.id);
        } else {
          await DeleteFile(this.entry.id);
        }
        ToastSuccess('Success');

        this.$emit('refresh');
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
