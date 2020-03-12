<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>Share</v-card-title>
        <v-card-text>
          <v-window v-model="step">
            <v-window-item :value="1">
              <share-form ref="form"></share-form>
              <div class="subtitle-1">You will share following entries:</div>
              <v-data-table :headers="headers" :items="entries"></v-data-table>
            </v-window-item>

            <v-window-item :value="2">
              <div class="subtitle-1 black--text">
                Share successfully! Your share token is
                <router-link :to="`/share/${token}`">
                  <span class="body-1 font-weight-bold">{{token}}</span>
                </router-link>
                <v-btn icon small @click="copy">
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            v-if="step === 1"
            :loading="loading"
            :disabled="loading"
            color="primary"
            depressed
            @click="nextClick"
          >Continue</v-btn>
          <v-btn text v-if="step === 2" color="primary" depressed @click="closeClick">Done</v-btn>
          <v-btn text v-if="step === 1" color="black" @click="closeClick">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { CreateShare } from '@/api/v1/share';

import { ToastError, ToastSuccess } from '@/util/toast';

export default {
  props: ['value', 'entries'],

  data: function() {
    return {
      step: 1,

      token: '',

      loading: false,

      headers: [
        {
          text: 'name',
          value: 'name',
        },
        {
          text: 'type',
          value: 'type',
        },
      ],
    };
  },

  components: {
    ShareForm: () => import('@/components/share/ShareForm.vue'),
  },

  computed: {
    dialog: {
      get: function() {
        return this.value;
      },
      set: function(value) {
        this.$emit('input', value);
        this.reset();
      },
    },

    form: function() {
      return this.$refs.form;
    },
  },

  methods: {
    nextClick: async function() {
      this.form.$v.$touch();
      if (
        (this.form.isPrivate && this.form.$v.accessCode.$invalid) ||
        (this.form.isTemp && this.form.$v.expire.$invalid)
      ) {
        console.log('invalid form');
        return;
      }

      // check if all entries is in same folder
      const folder_ids = [];
      const file_ids = [];
      const parent_id = this.entries[0].folder_id || this.entries[0].parent_id;
      for (const e of this.entries) {
        if ((e.parent_id || e.folder_id) != parent_id) {
          ToastError('share entries should be in the same folder');
          return;
        }
        if (e.type === 'folder') {
          folder_ids.push(e.id);
        } else {
          file_ids.push(e.id);
        }
      }

      try {
        this.loading = true;
        const data = await CreateShare({
          folder_ids,
          file_ids,
          parent_id,
          ...this.form.getFormData(),
        });
        this.token = data.result.token;
        ++this.step;
      } catch (error) {
        ToastError(error);
      } finally {
        this.loading = false;
      }
    },

    copy: async function() {
      const text = `Your share link is: /share/${this.token} ${
        this.form.isPrivate ? 'access code: ' + this.accessCode : ''
      }`;
      try {
        await this.$copyText(text);
        ToastSuccess('Copy successfully');
      } catch (error) {
        ToastError('Copy failed');
      }
    },

    closeClick: function() {
      this.dialog = false;
    },

    reset: function() {
      this.step = 1;
      this.token = '';
      this.loading = false;
      this.form.reset();
    },
  },
};
</script>
