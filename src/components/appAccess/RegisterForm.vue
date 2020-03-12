<template>
  <v-card class="elevation-12">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Fullbottle</v-toolbar-title>
    </v-toolbar>

    <v-card-text>
      <v-form>
        <v-text-field
          v-model="email"
          label="email"
          name="email"
          prepend-icon="email"
          type="text"
          :error-messages="emailErrors"
          required
          @input="$v.email.$touch()"
          @blur="$v.email.$touch()"
          @keyup.enter="registerClick"
        ></v-text-field>
        <v-text-field
          v-model="username"
          label="username"
          name="username"
          prepend-icon="person"
          type="text"
          :error-messages="usernameErrors"
          required
          @input="$v.username.$touch()"
          @blur="$v.username.$touch()"
          @keyup.enter="registerClick"
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="password"
          name="password"
          prepend-icon="lock"
          :type="showPwd ? 'text' : 'password'"
          :error-messages="passwordErrors"
          :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
          required
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
          @click:append="showPwd = !showPwd"
          @keyup.enter="registerClick"
        ></v-text-field>
        <v-text-field
          v-model="confirmPassword"
          label="confirm password"
          name="confirmPassword"
          prepend-icon="mdi-lock-outline"
          :type="showCPwd ? 'text' : 'password'"
          :error-messages="confirmPasswordErrors"
          :append-icon="showCPwd ? 'mdi-eye' : 'mdi-eye-off'"
          required
          @input="$v.confirmPassword.$touch()"
          @blur="$v.confirmPassword.$touch()"
          @click:append="showCPwd = !showCPwd"
          @keyup.enter="registerClick"
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn color="primary" text @click="loginClick">
        <v-icon left>mdi-arrow-left</v-icon>Login
      </v-btn>

      <v-btn color="primary" @click="registerClick">Register</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import { Register } from '@/api/v1/auth';

import { Validations, MapErrors } from '@/util/validation';
import { ToastError, ToastSuccess } from '@/util/toast';

const validations = {
  email: {
    required,
    ...Validations.email,
  },
  username: {
    required,
    ...Validations.username,
  },
  password: {
    required,
    ...Validations.password,
  },
  confirmPassword: {
    required,
    ...Validations.confirmPassword,
  },
};

export default {
  data: function() {
    return {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      showPwd: true,
      showCPwd: false,
    };
  },

  validations,

  computed: {
    emailErrors: MapErrors('email', validations.email),

    usernameErrors: MapErrors('username', validations.username),

    passwordErrors: MapErrors('password', validations.password),

    confirmPasswordErrors: MapErrors(
      'confirmPassword',
      validations.confirmPassword
    ),
  },

  methods: {
    registerClick: async function() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      try {
        await Register(this.$data);
        ToastSuccess('Success');
        this.$router.push('login');
      } catch (error) {
        ToastError(error);
      }
    },

    loginClick: function() {
      this.$router.push('/login');
    },
  },
};
</script>