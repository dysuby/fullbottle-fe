<template>
  <v-container>
    <file-list
      :canSelect="false"
      :folders="folders"
      :files="files"
      :loading="loading"
      @folder-click="folderClick"
      @file-click="fileClick"
    >
      <template v-slot:top>
        <v-row>
          <v-col cols="auto">
            <div class="headline">
              <span class="font-weight-bold">{{sharer.username}}</span>'s share
            </div>
          </v-col>
        </v-row>
        <v-btn
          v-if="isSharer"
          :disabled="!validShare"
          color="warning"
          class="mr-4 white--text"
          @click="modifyClick"
        >
          Modify
          <v-icon right dark>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          v-if="isSharer"
          :disabled="!validShare"
          color="info"
          class="mr-4 white--text"
          @click="cancelClick"
        >
          Cancel
          <v-icon right dark>mdi-cancel</v-icon>
        </v-btn>

        <v-row align="center">
          <v-col cols="auto">
            <span class="d-flex align-center">Current path:</span>
          </v-col>
          <v-col>
            <breadcrumbs :paths="bc" @breadcrumbs-click="breadcrumbsClick"></breadcrumbs>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            Expire at:
            <span class="font-weight-bold">{{formatExp}}</span>
          </v-col>
          <v-col cols="auto">
            <span>
              Vist times:
              <span class="font-weight-bold">{{visitTimes}}</span>
            </span>
          </v-col>
          <v-col cols="auto">
            <span>
              Download times:
              <span class="font-weight-bold">{{downloadTimes}}</span>
            </span>
          </v-col>
        </v-row>
      </template>

      <template v-slot:itemAction="{ item }">
        <v-icon
          v-if="item.type === 'file'"
          small
          class="mr-2"
          @click="downloadClick(item)"
        >mdi-download</v-icon>
        <v-icon
          v-if="isSharer && bc.length <= 1"
          small
          class="mr-2"
          @click="removeClick(item)"
        >mdi-close</v-icon>
      </template>
    </file-list>

    <cancel-dialog v-model="showCancel" :token="token" @refresh="fetchData"></cancel-dialog>
    <modify-dialog v-model="showModify" :token="token" @refresh="fetchData"></modify-dialog>
    <remove-dialog
      v-model="showRemove"
      :token="token"
      :entry="focusRemoveEntry"
      @refresh="fetchData"
    ></remove-dialog>
  </v-container>
</template>

<script>
import { normalize } from 'path';

import {
  GetShareInfo,
  GetShareEntry,
  GetShareStatus,
  PostShareAccessToken,
} from '@/api/v1/share';
import { GetUserPublic } from '@/api/v1/user';
import { DownloadShareEntry } from '@/api/v1/download';

import { ObjStatus } from '@/util/const';
import { ToastError } from '@/util/toast';
import { FromUnixSeconds } from '@/util/day';

const InitPaths = () => [{ path: '', text: 'root', disabled: false }];

export default {
  data: function() {
    return {
      folders: [],
      files: [],
      bc: [],

      loading: false,

      visitTimes: 0,
      downloadTimes: 0,
      exp: 0,

      shareStatus: {
        status: 2, // valid
      },

      sharer: {
        username: '',
      },

      showCancel: false,
      showModify: false,

      showRemove: false,
      focusRemoveEntry: {},
    };
  },

  created: async function() {
    await this.fetchData();
  },

  computed: {
    token: function() {
      return this.$route.params.token;
    },

    accessToken: function() {
      return this.$store.getters.shareAT(this.token).access_token;
    },

    isSharer: function() {
      return this.$store.getters.uid === this.shareStatus.owner_id;
    },

    path: function() {
      return normalize(`/${decodeURIComponent(this.$route.params.path || '')}`);
    },

    validShare: function() {
      return ObjStatus[this.shareStatus.status] === 'valid';
    },

    formatExp: function() {
      if (this.exp === 0) return 'Never';
      return FromUnixSeconds(this.exp).format('YYYY-MM-DD HH:mm:ss');
    },
  },

  components: {
    FileList: () => import('@/components/filesView/FileList.vue'),
    breadcrumbs: () => import('@/components/filesView/Breadcrumbs.vue'),
    CancelDialog: () => import('@/components/share/CancelDialog.vue'),
    ModifyDialog: () => import('@/components/share/ModifyDialog.vue'),
    RemoveDialog: () => import('@/components/share/RemoveDialog.vue'),
  },

  watch: {
    $route: 'fetchData',
  },

  methods: {
    fetchData: async function() {
      await this.GetShareStatus();
      return await Promise.all([
        this.shareInfo(),
        this.shareEntry(),
        this.fetchSharerInfo(),
      ]);
    },

    GetShareStatus: async function() {
      try {
        const data = await GetShareStatus(this.token);
        const result = data.result;

        this.sharer.id = result.owner_id;
        this.shareStatus = result;
        if (!this.validShare) {
          ToastError(
            `The share has been ${ObjStatus[this.shareStatus.status]}`
          );
          return;
        }

        // sharer visit or public share
        if (!this.$store.getters.shareAT(this.token)) {
          if (result.owner_id === this.$store.getters.uid || result.is_public) {
            await this.access();
          } else {
            return this.$router.push({
              path: `/share/${this.token}`,
            });
          }
        }
      } catch (error) {
        ToastError(error);
      }
    },

    fetchSharerInfo: async function() {
      try {
        const data = await GetUserPublic(this.sharer.id);
        this.sharer.username = data.result.username;
      } catch (error) {
        ToastError(error);
      }
    },

    shareInfo: async function() {
      if (!this.validShare) return;
      try {
        const data = await GetShareInfo({
          token: this.token,
          access_token: this.accessToken,
        });
        this.visitTimes = data.result.view_times || 0;
        this.downloadTimes = data.result.downloadTimes || 0;
        this.exp = data.result.exp || 0;
      } catch (error) {
        if (error.msg === 'Invalid token') {
          return this.onTokenExpire();
        }
        ToastError(error);
      }
    },

    shareEntry: async function() {
      if (!this.validShare) return;

      const path = this.path;
      try {
        const data = await GetShareEntry({
          token: this.token,
          access_token: this.accessToken,
          path,
        });
        this.folders = data.result.folders || [];
        this.files = data.result.files || [];
        this.resetPaths();
      } catch (error) {
        if (error.msg === 'Invalid token') {
          return this.onTokenExpire();
        }
        ToastError(error);
      }
    },

    onTokenExpire: function() {
      ToastError('Token expire');
      this.$store.commit('removeShareAT', this.token);
      this.$router.push({
        path: `/share/${this.token}`,
      });
    },

    resetPaths: async function() {
      if (!this.validShare) return;

      const path = this.path;
      const parts = path.split('/').slice(1);
      this.bc = InitPaths();
      if (parts && parts[0]) {
        for (const name of parts) {
          this.bc.push({
            path: `${this.bc[this.bc.length - 1].path}/${name}`,
            text: name,
            disabled: false,
          });
        }
      }
      this.bc[this.bc.length - 1].disabled = true;
    },

    access: async function() {
      if (!this.validShare) return;

      try {
        const data = await PostShareAccessToken({
          token: this.token,
          code: this.accessCode,
        });
        this.$store.commit('storeShareAT', {
          token: this.token,
          at: data.result,
        });
      } catch (error) {
        ToastError(error);
      }
    },

    modifyClick: function() {
      if (!this.validShare) return;
      this.showModify = true;
    },

    cancelClick: function() {
      if (!this.validShare) return;
      this.showCancel = true;
    },

    downloadClick: async function(entry) {
      if (!this.validShare) return;

      if (entry.type !== 'file') return;
      return await DownloadShareEntry({
        token: this.token,
        access_token: this.accessToken,
        path: this.path,
        file_id: entry.id,
      });
    },

    removeClick: async function(entry) {
      if (!this.validShare) return;

      this.focusRemoveEntry = entry;
      this.showRemove = true;
    },

    folderClick: function(entry) {
      if (!this.validShare) return;

      return this.jumpFolder(`${this.path}/${entry.name}`);
    },

    fileClick: function(entry) {
      if (!this.validShare) return;

      return;
    },

    breadcrumbsClick: function(entry) {
      if (!this.validShare) return;

      return this.jumpFolder(entry.path);
    },

    jumpFolder: function(path) {
      if (!this.validShare) return;

      this.$router.push({
        path: `/share/${this.token}/view/${encodeURIComponent(
          normalize(path)
        )}`,
      });
    },
  },
};
</script>
