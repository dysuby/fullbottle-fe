<template>
  <v-container>
    <file-list
      v-model="selected"
      :folders="folders"
      :files="files"
      :loading="loading"
      @folder-click="folderClick"
      @file-click="fileClick"
    >
      <template v-slot:top>
        <v-btn color="blue-grey" class="mr-4 white--text" @click="uploadClick">
          Upload
          <v-icon right dark>mdi-cloud-upload</v-icon>
        </v-btn>
        <v-btn color="info" class="mr-4 white--text" @click="createFolder">
          New Folder
          <v-icon right dark>mdi-folder</v-icon>
        </v-btn>

        <v-btn
          v-show="selected.length > 0"
          color="error"
          class="mr-4 white--text"
          @click="batchDeleteEntries"
        >
          Delete
          <v-icon right dark>mdi-delete</v-icon>
        </v-btn>
        <v-row align="center">
          <v-col cols="auto">
            <span class="d-flex align-center">Current path:</span>
          </v-col>
          <v-col>
            <breadcrumbs
              :paths="paths"
              large
              class="less-border"
              @breadcrumbs-click="breadcrumbsClick"
            ></breadcrumbs>
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
        <v-icon small class="mr-2" @click="editEntry(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteEntry(item)">mdi-delete</v-icon>
      </template>
    </file-list>

    <delete-dialog v-model="showDelete" :entries="focusDeleteEntries"></delete-dialog>

    <create-folder-dialog v-model="showCreateFolder" :parent_id="currentFolder.id"></create-folder-dialog>

    <update-entry-dialog v-model="showUpdateEntry" :entry="focusUpdateEntry"></update-entry-dialog>

    <preview-dialog :entry="focusPreviewEntry"></preview-dialog>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';

import {
  GetFilesByFolderId,
  GetFilesByPath,
  GetFolderParents,
} from '@/api/v1/bottle';
import { DownloadFile } from '@/api/v1/download';

import { VIRTUAL_ROOT } from '@/util/const';
import { ToastError, ToastSuccess } from '@/util/toast';

const InitPaths = () => [{ id: VIRTUAL_ROOT, text: 'home', disabled: false }];

export default {
  data: function() {
    return {
      loading: true,
      paths: InitPaths(),

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
      folders: [],
      files: [],

      showDelete: false,
      focusDeleteEntries: [],

      showCreateFolder: false,

      showUpdateEntry: false,
      focusUpdateEntry: {},

      showPreview: false,
      focusPreviewEntry: {},
    };
  },

  components: {
    FileList: () => import('@/components/filesView/FileList.vue'),
    breadcrumbs: () => import('@/components/filesView/Breadcrumbs.vue'),

    DeleteDialog: () => import('@/components/space/DeleteDialog.vue'),
    CreateFolderDialog: () =>
      import('@/components/space/CreateFolderDialog.vue'),
    UpdateEntryDialog: () => import('@/components/space/UpdateEntryDialog.vue'),
    PreviewDialog: () => import('@/components/space/PreviewDialog.vue'),
  },

  created: async function() {
    await this.fetchData();
  },

  computed: {
    ...mapState(['currentFolder', 'fileChange']),
  },

  watch: {
    $route: 'refresh',
    fileChange: function() {
      this.refresh();
    },
  },

  methods: {
    refresh: async function() {
      await this.fetchData(true);
      this.selected = [];
      this.focusDeleteEntries = [];
      this.focusUpdateEntry = {};
    },

    fetchData: async function(force = false) {
      this.loading = true;
      const path = this.$route.query.path;

      try {
        const id = Number(this.$route.params.fid);
        let parent;
        // check if has cache
        if (
          !force &&
          id &&
          this.currentFolder.id &&
          id === this.currentFolder.id
        ) {
          parent = this.currentFolder;
        } else {
          // fetch from server
          let data = null;
          if (!id && path) {
            data = await GetFilesByPath(path);
          } else {
            data = await GetFilesByFolderId(id ? id : VIRTUAL_ROOT);
          }
          parent = data.result;
        }

        // cache
        this.$store.commit('setCurrentFolder', parent);
        if (!id && parent.id != VIRTUAL_ROOT) {
          return this.$router.push({ params: { fid: parent.id } });
        }
        await this.resetPaths();
        this.folders = parent.folders || [];
        this.files = parent.files || [];
      } catch (error) {
        ToastError(error);
      } finally {
        this.loading = false;
      }
    },

    resetPaths: async function() {
      try {
        const id = Number(this.currentFolder.id);
        if (!id) return;
        const data = await GetFolderParents(id);
        let parents = data.result;
        if (!parents) {
          parents = [];
        }
        const paths = [
          ...InitPaths(),
          ...parents.map(v => ({
            id: v.folder_id,
            text: v.name,
            disabled: false,
          })),
        ];
        paths[paths.length - 1].disabled = true;
        this.paths = paths;
      } catch (error) {
        ToastError(error);
      }
    },

    folderClick: function(item) {
      return this.jumpFolder(item.id);
    },

    fileClick: function(item) {
      // pre check in dialog component, so there is no need to show dialog first
      this.focusPreviewEntry = item;
    },

    breadcrumbsClick: function(item) {
      return this.jumpFolder(item.id);
    },

    jumpFolder: function(fid) {
      if (Number(fid) === VIRTUAL_ROOT) {
        return this.$router.push({ path: '/home/space' });
      } else {
        return this.$router.push({ path: `/home/space/${fid}` });
      }
    },

    editEntry: function(entry) {
      this.focusUpdateEntry = entry;
      this.showUpdateEntry = true;
    },

    deleteEntry: function(entry) {
      this.focusDeleteEntries = [entry];
      this.showDelete = true;
    },

    batchDeleteEntries: function() {
      this.focusDeleteEntries = this.selected;
      this.showDelete = true;
    },

    createFolder: function() {
      this.showCreateFolder = true;
    },

    uploadClick: function() {
      this.$store.commit('switchUploadDialog');
    },

    downloadClick: function(item) {
      if (item.type !== 'file') return;
      DownloadFile(item.id);
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
