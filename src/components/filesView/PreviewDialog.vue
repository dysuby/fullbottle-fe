<template>
  <v-dialog v-model="dialog" max-height="400" max-width="400" hide-overlay>
    <v-card>
      <v-skeleton-loader v-if="previewLoading" type="image"></v-skeleton-loader>

      <v-img :src="previewSrc" v-show="previewSrc"></v-img>
    </v-card>
  </v-dialog>
</template>

<script>
import { ImageTumbnail } from '@/api/v1/download';
import { extFileType } from '@/util/const';
import { ToastError, ToastInfo } from '@/util/toast';

export default {
  props: ['entry'],

  data: function() {
    return {
      previewSrc: '',
      previewLoading: false,
      dialog: false,
    };
  },

  watch: {
    entry: async function() {
      const fileType = extFileType(this.entry.name.toLowerCase());
      if (fileType !== 'image' || this.entry.size > 5 << 20) {
        ToastInfo('Only image small than 5MB can be previewd');
        return;
      }

      this.dialog = true;
      this.previewSrc = '';
      this.previewLoading = true;
      try {
        const src = await ImageTumbnail(this.entry.id, 400, 400);
        this.previewLoading = false;
        this.previewSrc = src;
      } catch (error) {
        ToastError(error);
        this.dialog = false;
      }
    },
  },
};
</script>
