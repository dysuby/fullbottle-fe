<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>Ready to remove it from share?</v-card-title>
        <v-card-text class="red--text font-weight-medium">
          <span>This operation is irreversible</span>
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
import { RemoveShreEntries } from '@/api/v1/share';
import { ToastError, ToastSuccess } from '@/util/toast';

export default {
  props: ['value', 'entry', 'token'],

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
        let fileIds = [];
        let folderIds = [];
        if (this.entry.type === 'folder') folderIds.push(this.entry.id);
        else fileIds.push(this.entry.id);

        await RemoveShreEntries({
          token: this.token,
          file_ids: fileIds,
          folder_ids: folderIds,
        });
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
