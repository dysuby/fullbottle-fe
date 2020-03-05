<template>
  <v-container>
    <v-row justify="center">
      <v-card flat>
        <v-card-title class="justify-center">
          <v-avatar size="120px" class="img-clickable" @click.stop="avatarPick">
            <input
              type="file"
              ref="avatarInput"
              class="hide"
              accept="image/*"
              @change="onAvatarPicked"
            />
            <v-img :src="userAvatar" alt="Avatar"></v-img>
          </v-avatar>
        </v-card-title>
        <!-- <div class="text-center grey--text">Avatar size cannot exceed 1MB</div> -->
      </v-card>
    </v-row>

    <v-row>
      <v-col xs12 sm8 md4>
        <v-form>
          <v-text-field
            disabled
            :value="email"
            label="email"
            name="email"
            prepend-icon="email"
            type="text"
            class="grey-text"
          ></v-text-field>
          <v-text-field
            v-model="username"
            label="username"
            name="username"
            prepend-icon="person"
            type="text"
            :error-messages="usernameErrors"
            @input="$v.username.$touch()"
            @blur="$v.username.$touch()"
          ></v-text-field>
          <v-text-field
            disabled
            :value="roleName"
            label="role"
            name="role"
            prepend-icon="mdi-account-multiple"
            type="text"
            class="grey-text"
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="password"
            name="password"
            prepend-icon="lock"
            type="password"
            :error-messages="passwordErrors"
            @input="$v.password.$touch()"
            @blur="$v.password.$touch()"
          ></v-text-field>
          <v-text-field
            v-model="confirmPassword"
            label="confirm password"
            name="confirmPassword"
            prepend-icon="mdi-lock-outline"
            type="password"
            :error-messages="confirmPasswordErrors"
            @input="$v.confirmPassword.$touch()"
            @blur="$v.confirmPassword.$touch()"
          ></v-text-field>
          <v-text-field
            disabled
            :value="joinDate"
            label="joinDate"
            name="joinDate"
            prepend-icon="mdi-calendar-range"
            type="text"
            class="grey-text"
          ></v-text-field>
          <v-row>
            <v-col align="center">
              <v-btn color="success" class="ms-4" @click="save">Save</v-btn>
              <v-btn color="error" class="ms-4" @click="reset">Reset</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';

import { GetUserInfo, UpdateUserInfo, UploadUserAvatar } from '@/api/v1/user';
import { RoleMap } from '@/util/const';
import { FromUnixSeconds } from '@/util/day';
import { Validations, MapErrors } from '@/util/validation';

const validations = {
  username: {
    ...Validations.username,
  },
  password: {
    ...Validations.password,
  },
  confirmPassword: {
    ...Validations.confirmPassword,
  },
};

export default {
  data: function() {
    return {
      email: '',
      username: '',
      role: 1,
      password: '',
      confirmPassword: '',
      joinDate: '',
      userInfo: {},
    };
  },

  created: async function() {
    await this.fetchData();
  },

  validations,

  computed: {
    usernameErrors: MapErrors('username', validations.username),

    passwordErrors: MapErrors('password', validations.password),

    confirmPasswordErrors: MapErrors(
      'confirmPassword',
      validations.confirmPassword
    ),

    roleName: function() {
      return RoleMap(this.role);
    },

    ...mapState(['userAvatar']),
  },

  watch: {
    $route: 'fetchData',
  },

  methods: {
    fetchData: async function() {
      try {
        const resp = await GetUserInfo();
        const data = resp.data.user;
        this.email = data.email;
        this.username = data.username;
        this.role = data.role;
        this.joinDate = FromUnixSeconds(data.create_time).format('YYYY-MM-DD');
        if (data.avatar_fid) {
          this.$store.commit('updateAvatar');
        }
        this.userInfo = data;
      } catch (error) {
        this.$toast.error(error.msg);
      }
    },

    save: async function() {
      if (this.$v.$touch() && this.$v.$invalid) {
        return;
      }
      try {
        await UpdateUserInfo({
          username: this.username,
          password: this.password,
        });
        this.$toast.success('Success');
        await this.fetchData();
      } catch (error) {
        this.$toast.error(error.msg);
      }
    },
    reset: function() {
      this.$v.$reset();
      this.username = this.userInfo.username;
      this.password = this.confirmPassword = '';
    },

    avatarPick: function() {
      this.$refs.avatarInput.click();
    },

    onAvatarPicked: async function(e) {
      const files = e.target.files;
      try {
        const file = files[0];
        if (file.size > 1 << 20) {
          throw { msg: 'Avatar size cannot exceed 1MB' };
        }
        await UploadUserAvatar(file);
        this.$store.commit('updateAvatar');
      } catch (error) {
        this.$toast.error(error.msg);
      }
      return;
    },
  },
};
</script>

<style scoped>
.img-clickable {
  cursor: pointer;
}

.hide {
  display: none;
}

.grey-text >>> .v-text-field__slot * {
  color: grey;
}
</style>