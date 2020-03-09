<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" min-width="700px" max-width="1000px">
      <v-card>
        <uploader
          :options="options"
          :autoStart="false"
          @file-added="fileAdded"
          @file-success="fileSuccess"
          @file-error="fileError"
        >
          <v-card-title class="py-3">Upload File</v-card-title>

          <uploader-drop class="mx-3">
            <v-card-actions>
              <v-row align="center">
                <v-col>
                  <v-btn elevation="0" outlined @click.stop="uploadClick">select files</v-btn>
                </v-col>
                <v-col>
                  <v-icon>mdi-download</v-icon>
                  <span>OR drop files here to upload</span>
                </v-col>
              </v-row>
              <uploader-btn id="uploader-btn" />
            </v-card-actions>
            <uploader-unsupport />
          </uploader-drop>
          <v-card-text>
            <uploader-files>
              <template v-slot:default="{ files }">
                <uploader-file
                  v-for="file in files"
                  :file="file"
                  :key="file.id"
                  :ref="`file${file.id}`"
                >
                  <template v-slot:default="attrs">
                    <v-row>
                      <v-col cols="auto">
                        <v-icon>{{ fileIcon(attrs.fileCategory) }}</v-icon>
                      </v-col>

                      <v-col cols="4">
                        <span>{{ file.name }}</span>
                      </v-col>

                      <v-col cols="2">
                        <span>{{ attrs.formatedSize }}</span>
                      </v-col>

                      <v-col>
                        <span
                          v-show="attrs.status !== 'uploading'"
                          class="text-capitalize"
                        >{{attrs.status}}</span>
                        <span v-show="attrs.status === 'uploading'">{{ attrs.formatedAverageSpeed }}</span>
                      </v-col>

                      <v-col>
                        <span
                          v-show="attrs.status === 'uploading'"
                        >{{ attrs.formatedTimeRemaining }}</span>
                      </v-col>

                      <v-spacer />
                      <v-col cols="auto">
                        <v-btn
                          v-if="attrs.paused"
                          icon
                          small
                          @click="fileAction(file.id, 'resume')"
                        >
                          <v-icon>mdi-play</v-icon>
                        </v-btn>
                        <v-btn
                          v-else-if="attrs.error"
                          icon
                          small
                          @click="fileAction(file.id, 'retry')"
                        >
                          <v-icon>mdi-replay</v-icon>
                        </v-btn>
                        <v-btn
                          v-else-if="attrs.isUploading"
                          icon
                          small
                          @click="fileAction(file.id, 'pause')"
                        >
                          <v-icon>mdi-pause</v-icon>
                        </v-btn>

                        <v-btn icon small @click="fileAction(file.id, 'remove')">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </template>
                </uploader-file>
              </template>
            </uploader-files>
          </v-card-text>
        </uploader>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapState } from 'vuex';
import SparkMD5 from 'spark-md5';

import { getJwtToken } from '@/api/http';
import {
  UPLOAD_URL,
  GetUploadToken,
  UploadFile,
  CancelUpload,
} from '@/api/v1/upload';
import { CHUNK_SIZE, CalculateFileChunkMd5 } from '@/util/file';
import { ToastError, ToastSuccess } from '@/util/toast';

const chunkNum2Offset = function(num) {
  return num * CHUNK_SIZE;
};

export default {
  data() {
    return {
      options: {
        target: UPLOAD_URL,

        chunkSize: 1 << 20,
        forceChunkSize: true, // make every chunk size equal or less than chunkSize

        headers: function() {
          return { authorization: getJwtToken() };
        },

        generateUniqueIdentifier: function(file) {
          return file.hash;
        },

        processParams: function(params, file, chunk, isTest) {
          const p = {
            token: file.uploadToken,
            offset: chunkNum2Offset(chunk.offset),
            chunk_hash: file.chunkHash[chunk.offset],
          };
          return p;
        },

        checkChunkUploadedByResponse: function(chunk, data) {
          try {
            const result = JSON.parse(data).result;
            result.uploaded = result.uploaded || [];

            return (
              !result.need_upload ||
              result.uploaded.indexOf(chunkNum2Offset(chunk.offset)) >= 0
            );
          } catch (error) {
            ToastError(error);
          }
        },
      },
    };
  },

  computed: {
    dialog: {
      get: function() {
        return this.$store.state.uploadDialog;
      },
      set: function() {
        this.$store.commit('switchUploadDialog');
      },
    },

    ...mapState(['currentFolder']),
  },

  methods: {
    fileAdded: async function(file) {
      // post token
      file.pause();
      try {
        // calculate each chunk md5
        const chunkHash = await CalculateFileChunkMd5(file.file);
        file.chunkHash = chunkHash;
        file.hash = SparkMD5.hash(chunkHash.join(''));

        await this.preprocess(file);

        file.resume();
      } catch (error) {
        ToastError(error);
        this.fileAction(file.id, 'cancel');
      }
    },

    preprocess: async function(file) {
      const resp = await GetUploadToken({
        folder_id: this.currentFolder.id,
        filename: file.name,
        mime: file.fileType,
        hash: file.hash,
        size: file.size,
      });
      const result = resp.data.result;

      file.uploadToken = result.token;
      if (!result.need_upload) {
        await UploadFile({
          token: file.uploadToken,
          offset: 0,
          chunk_hash: file.chunkHash[0],
        });
      }
    },

    fileSuccess: function(rootFile, file, message, chunk) {
      ToastSuccess(`Upload ${file.name} successfully`);
    },

    fileError: function(rootFile, file, message, chunk) {
      ToastError(`Upload ${file.name} failed`);
    },

    fileRemove: async function(file) {
      if (!file.token) return;
      try {
        await CancelUpload(file.token);
      } catch (error) {
        console.log(error);
      }
    },

    uploadClick: function() {
      document.getElementById('uploader-btn').click();
    },

    fileAction: function(fileId, action) {
      return this.$refs[`file${fileId}`][0][action]();
    },

    fileIcon: function(category) {
      const iconMap = {
        image: 'mdi-image',
        document: 'mdi-file-document-outline',
        video: 'mdi-video',
        audio: 'mdi-music',
        unknown: 'mdi-file',
      };
      return iconMap[category] || 'mdi-file';
    },
  },
};
</script>

<style scoped>
.uploader-btn {
  background: none;
  border: none;
  margin: 0;
  padding: 0;
}
</style>