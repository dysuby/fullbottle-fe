<template>
  <v-container>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="entries"
      item-key="folder_id"
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
        <v-btn color="info" class="mr-4 white--text">
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
                <span :class="breadcrumbsClass(item)" @click="jumpFolder(item.id)">{{item.text}}</span>
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
        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
      </template>
      <template v-slot:no-data>You have no files here</template>
    </v-data-table>
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
    };
  },

  created: async function() {
    await this.fetchData();
  },

  computed: {
    entries: function() {
      return [...this.folders, ...this.files];
    },
  },

  watch: {
    $route: async function() {
      await this.fetchData();
    },
  },

  methods: {
    fetchData: async function() {
      const path = this.$route.query.path;

      try {
        const id = Number(this.$route.params.fid);
        let parent;
        // check if has cache
        if (
          id &&
          this.$store.state.currentFolder.folder_id &&
          id === this.$store.state.currentFolder.folder_id
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
        if (!id && parent.folder_id != VIRTUAL_ROOT) {
          return this.$router.push({ params: { fid: parent.folder_id } });
        }
        await this.resetPaths();

        // to view data
        this.folders = parent.folders
          ? parent.folders.map(v => ({ ...v, type: 'folder' }))
          : [];
        this.files = parent.files
          ? parent.files.map(v => ({ ...v, type: 'file' }))
          : [];
      } catch (error) {
        this.$toast.error(error.msg);
      }
    },

    resetPaths: async function() {
      try {
        const id = Number(this.$store.state.currentFolder.folder_id);
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
      const id = item.folder_id;
      return this.jumpFolder(id);
    },

    jumpFolder: function(fid) {
      if (Number(fid) === VIRTUAL_ROOT) {
        return this.$router.push({ path: '/space' }).catch(() => {});
      } else {
        return this.$router.push({ params: { fid } });
      }
    },

    editItem: function() {},

    deleteItem: function() {},

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
