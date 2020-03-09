<template>
  <v-container>
    <file-list :folders="folders" :files="files" :loading="loading" @folder-click="folderClick">
      <template v-slot:top>
        <v-btn color="blue-grey" class="mr-4 white--text" @click="uploadClick">
          Upload
          <v-icon right dark>mdi-cloud-upload</v-icon>
        </v-btn>
        <v-btn color="info" class="mr-4 white--text" @click="createFolder">
          New Folder
          <v-icon right dark>mdi-folder</v-icon>
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

    <delete-dialog v-model="showDelete" :entry="focusDeleteEntry" @refresh="fetchData(true)"></delete-dialog>

    <create-folder-dialog
      v-model="showCreateFolder"
      :parent_id="currentFolder.id"
      @refresh="fetchData(true)"
    ></create-folder-dialog>

    <update-entry-dialog
      v-model="showUpdateEntry"
      :entry="focusUpdateEntry"
      @refresh="fetchData(true)"
    ></update-entry-dialog>
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
      focusDeleteEntry: { type: 'folder' },

      showCreateFolder: false,

      showUpdateEntry: false,
      focusUpdateEntry: { type: 'folder' },
    };
  },

  components: {
    FileList: () => import('@/components/filesView/FileList.vue'),
    breadcrumbs: () => import('@/components/filesView/Breadcrumbs.vue'),

    DeleteDialog: () => import('@/components/space/DeleteDialog.vue'),
    CreateFolderDialog: () =>
      import('@/components/space/CreateFolderDialog.vue'),
    UpdateEntryDialog: () => import('@/components/space/UpdateEntryDialog.vue'),
  },

  created: async function() {
    await this.fetchData();
  },

  computed: mapState(['currentFolder', 'uploadDialog']),

  watch: {
    $route: 'fetchData',
    uploadDialog: function() {
      if (!this.$store.state.uploadDialog) this.fetchData();
    },
  },

  methods: {
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
          let resp = null;
          if (!id && path) {
            resp = await GetFilesByPath(path);
          } else {
            resp = await GetFilesByFolderId(id ? id : VIRTUAL_ROOT);
          }
          parent = resp.data.result;
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
        const resp = await GetFolderParents(id);
        let parents = resp.data.result;
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

    breadcrumbsClick: function(item) {
      return this.jumpFolder(item.id);
    },

    jumpFolder: function(fid) {
      if (Number(fid) === VIRTUAL_ROOT) {
        return this.$router.push({ path: '/home/space' });
      } else {
        return this.$router.push({ params: { fid } });
      }
    },

    editEntry: function(entry) {
      this.focusUpdateEntry = entry;
      this.showUpdateEntry = true;
    },

    deleteEntry: function(entry) {
      this.focusDeleteEntry = entry;
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
