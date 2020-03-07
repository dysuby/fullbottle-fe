<template>
  <v-container>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="entries"
      :loading="loading"
      loading-text="loading..."
      item-key="key"
      show-select
      disable-pagination
      disable-sort
      hide-default-footer
      fixed-header
    >
      <template v-slot:top>
        <v-btn color="blue-grey" class="mr-4 white--text">
          Upload
          <v-icon right dark>mdi-cloud-upload</v-icon>
        </v-btn>
        <v-btn color="info" class="mr-4 white--text" @click="createFolder">
          New Folder
          <v-icon right dark>mdi-folder</v-icon>
        </v-btn>
        <v-row align="center">
          <v-col md="auto" lg="auto" sm="auto">
            <span class="d-flex align-center">Current path:</span>
          </v-col>
          <v-col>
            <v-breadcrumbs :items="paths" large class="less-border">
              <template v-slot:item="{ item }">
                <span :class="breadcrumbsClass(item)" @click="breadcrumbsClick(item)">{{item.text}}</span>
              </template>
            </v-breadcrumbs>
          </v-col>
        </v-row>
      </template>

      <template v-slot:item.icon="{ item }">
        <v-icon>{{ getIcon(item.type) }}</v-icon>
      </template>

      <template v-slot:item.name="{ item }">
        <span class="clickable-hover-color pointer-curson" @click="entryClick(item)">{{item.name}}</span>
      </template>

      <template v-slot:item.update_time="{ item }">{{ formatDate(item.update_time) }}</template>

      <template v-slot:item.size="{ item }">{{ formaatSize(item.size) }}</template>

      <template v-slot:item.action="{ item }">
        <v-icon small class="mr-2" @click="editEntry(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteEntry(item)">mdi-delete</v-icon>
      </template>
      <template v-slot:no-data>You have no files here</template>
    </v-data-table>

    <delete-dialog v-model="showDelete" :entry="focusDeleteEntry" @refresh="fetchData(true)"></delete-dialog>

    <create-folder-dialog
      v-model="showCreateFolder"
      :parent_id="currentFolderId"
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
import {
  GetFilesByFolderId,
  GetFilesByPath,
  GetFolderParents,
  VIRTUAL_ROOT,
} from '@/api/v1/bottle';
import { FromUnixSeconds } from '@/util/day';
import { SizeUnitConv } from '@/util/file';

const InitPaths = () => [{ id: VIRTUAL_ROOT, text: 'home', disabled: false }];

export default {
  data: function() {
    return {
      loading: true,
      selected: [],
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
    DeleteDialog: () => import('@/components/space/DeleteDialog.vue'),
    CreateFolderDialog: () =>
      import('@/components/space/CreateFolderDialog.vue'),
    UpdateEntryDialog: () => import('@/components/space/UpdateEntryDialog.vue'),
  },

  created: async function() {
    await this.fetchData();
  },

  computed: {
    entries: function() {
      // to view data
      const folder = this.folders
        ? this.folders.map(v => ({
            ...v,
            type: 'folder',
            key: `folder:${v.id}`,
          }))
        : [];
      const files = this.files
        ? this.files.map(v => ({ ...v, type: 'file', key: `file:${v.id}` }))
        : [];

      return [...folder, ...files];
    },

    currentFolderId: function() {
      return this.paths[this.paths.length - 1].id;
    },
  },

  watch: {
    $route: async function() {
      await this.fetchData();
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
          this.$store.state.currentFolder.id &&
          id === this.$store.state.currentFolder.id
        ) {
          parent = this.$store.state.currentFolder;
        } else {
          // fetch from server
          let resp = null;
          if (!id && path) {
            resp = await GetFilesByPath(path);
          } else {
            resp = await GetFilesByFolderId(id ? id : VIRTUAL_ROOT);
          }
          parent = resp.data.folder;
        }

        // cache
        this.$store.commit('setCurrentFolder', parent);
        if (!id && parent.id != VIRTUAL_ROOT) {
          return this.$router.push({ params: { fid: parent.id } });
        }
        await this.resetPaths();
        this.folders = parent.folders ? parent.folders : [];
        this.files = parent.files ? parent.files : [];
      } catch (error) {
        this.$toast.error(error.msg);
      } finally {
        this.loading = false;
      }
    },

    resetPaths: async function() {
      try {
        const id = Number(this.$store.state.currentFolder.id);
        if (!id) return;
        const resp = await GetFolderParents(id);
        let parents = resp.data.parents;
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
        this.$toast.error(error.msg);
      }
    },

    entryClick: function(item) {
      if (item.type !== 'folder') return;
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

    formatDate: function(seconds) {
      return FromUnixSeconds(seconds).format('YYYY-MM-DD HH:mm:ss');
    },

    formaatSize: function(size) {
      if (!size) return '-';
      const f = SizeUnitConv(size);
      return `${f.value}${f.unit}`;
    },

    getIcon: function(type) {
      if (type === 'folder') return 'mdi-folder';
      return 'mdi-file';
    },

    breadcrumbsClass: function(item) {
      if (item.disabled) return '';
      return 'pointer-curson clickable-color';
    },

    breadcrumbsClick: function(item) {
      if (item.disabled) return;
      return this.jumpFolder(item.id);
    },
  },
};
</script>

<style scoped>
.pointer-curson {
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
