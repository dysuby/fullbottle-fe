<template>
  <v-card class="elevation-12">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Fullbottle Share</v-toolbar-title>
    </v-toolbar>
    <v-card-title class="body-1">
      <v-avatar class="mr-2" size="40px">
        <v-img :src="sharer.avatar"></v-img>
      </v-avatar>
      <span class="font-weight-bold pr-1">{{ sharer.username }}</span>
      share files to you secretly~
    </v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field
          v-model="accessCode"
          label="access code"
          name="code"
          prepend-icon="lock"
          type="text"
          :error-messages="accessCodeErrors"
          @input="$v.accessCode.$touch()"
          @blur="$v.accessCode.$touch()"
          @keyup.enter="submitClick"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="submitClick">Submit</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import { GetUserPublic, GetUserAvartar } from '@/api/v1/user';
import { GetShareStatus, PostShareAccessToken } from '@/api/v1/share';

import { Validations, MapErrors } from '@/util/validation';
import { Now, FromUnixSeconds } from '@/util/day';
import { DEFAULT_AVATAR, ObjStatus } from '@/util/const';
import { ToastError } from '@/util/toast';

const validations = {
  accessCode: { required, ...Validations.accessCode },
};

export default {
  data: function() {
    return {
      sharer: {
        id: 0,
        username: '',
        avatar: DEFAULT_AVATAR,
      },

      accessCode: '',
    };
  },

  created: async function() {
    // already has token
    const at = this.$store.getters.shareAT(this.token);
    if (at && Now().isBefore(FromUnixSeconds(at.exp))) {
      return this.to();
    }

    await this.shareStatus();
  },

  computed: {
    token: function() {
      return this.$route.params.token;
    },

    accessCodeErrors: MapErrors('accessCode', validations.accessCode),
  },

  validations,

  methods: {
    shareStatus: async function() {
      try {
        const data = await GetShareStatus(this.token);
        const result = data.result;
        this.sharer.id = result.owner_id;

        // sharer visit or public share
        if (result.owner_id === this.$store.getters.uid || result.is_public) {
          return await this.access();
        }

        // fetch sharer info
        await this.fetchSharerInfo();
      } catch (error) {
        ToastError(error);
      }
    },

    fetchSharerInfo: async function() {
      try {
        const [data, avatar] = await Promise.all([
          GetUserPublic(this.sharer.id),
          GetUserAvartar(this.sharer.id),
        ]);
        this.sharer.avatar = avatar;
        this.sharer.username = data.result.username;
      } catch (error) {
        ToastError(error);
      }
    },

    submitClick: async function() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      await this.access();
    },

    access: async function() {
      try {
        const data = await PostShareAccessToken({
          token: this.token,
          code: this.accessCode,
        });
        this.$store.commit('storeShareAT', {
          token: this.token,
          at: data.result,
        });
        return this.to();
      } catch (error) {
        ToastError(error);
      }
    },

    to: function() {
      return this.$router.push({
        path: `/share/${this.token}/view`,
      });
    },
  },
};
</script>
