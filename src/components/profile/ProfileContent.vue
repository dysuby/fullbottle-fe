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
            <v-img :src="avatar" alt="Avatar" class="align-center"></v-img>
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
            :type="showPwd ? 'text' : 'password'"
            :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
            :error-messages="passwordErrors"
            @input="$v.password.$touch()"
            @blur="$v.password.$touch()"
            @click:append="showPwd = !showPwd"
          ></v-text-field>
          <v-text-field
            v-model="confirmPassword"
            label="confirm password"
            name="confirmPassword"
            prepend-icon="mdi-lock-outline"
            :type="showCPwd ? 'text' : 'password'"
            :append-icon="showCPwd ? 'mdi-eye' : 'mdi-eye-off'"
            :error-messages="confirmPasswordErrors"
            @input="$v.confirmPassword.$touch()"
            @blur="$v.confirmPassword.$touch()"
            @click:append="showCPwd = !showCPwd"
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

import {
  GetUserInfo,
  UpdateUserInfo,
  UploadUserAvatar,
  GetUserAvartar,
} from '@/api/v1/user';
import { RoleMap, DEFAULT_AVATAR } from '@/util/const';
import { FromUnixSeconds } from '@/util/day';
import { Validations, MapErrors } from '@/util/validation';
import { ToastError, ToastSuccess, ToastInfo } from '@/util/toast';

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
      avatar: DEFAULT_AVATAR,

      showPwd: false,
      showCPwd: false,
    };
  },

  created: async function() {
    Promise.all([this.fetchData(), this.fetchAvatar()]);
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
  },

  methods: {
    fetchData: async function() {
      try {
        const data = await GetUserInfo();
        const result = data.result;
        this.email = result.email;
        this.username = result.username;
        this.role = result.role;
        this.joinDate = FromUnixSeconds(result.create_time).format(
          'YYYY-MM-DD'
        );
        this.userInfo = result;
      } catch (error) {
        ToastError(error);
      }
    },

    fetchAvatar: async function() {
      try {
        const avatar = await GetUserAvartar(this.$store.getters.uid);
        this.avatar = avatar;
      } catch (error) {
        ToastError(error);
      }
    },

    save: async function() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      try {
        await UpdateUserInfo({
          username: this.username,
          password: this.password,
        });
        ToastSuccess('Success');
        await this.fetchData();
      } catch (error) {
        ToastError(error);
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
        ToastInfo('Uploading...');

        await UploadUserAvatar(file);
        await this.fetchAvatar();

        this.$store.commit('refreshAvatar', this.avatar);

        ToastSuccess('Success');
      } catch (error) {
        ToastError(error);
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