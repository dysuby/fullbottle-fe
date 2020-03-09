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
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="password"
          name="password"
          prepend-icon="lock"
          type="password"
          :error-messages="passwordErrors"
          required
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn color="primary" @click="loginClick">Login</v-btn>

      <v-btn color="primary" @click="registerClick" text>
        Register
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import { Login } from '@/api/v1/auth';

import { Validations, MapErrors } from '@/util/validation';
import { ToastError } from '@/util/toast';

const validations = {
  email: {
    required,
    ...Validations.email,
  },
  password: {
    required,
    ...Validations.password,
  },
};

export default {
  data: () => ({
    email: '',
    password: '',
  }),

  validations,

  computed: {
    emailErrors: MapErrors('email', validations.email),

    passwordErrors: MapErrors('password', validations.password),
  },

  methods: {
    loginClick: async function() {
      if (this.$v.$touch() && this.$v.$invalid) {
        return;
      }
      try {
        const resp = await Login(this.$data);

        // store auth info
        localStorage.setItem('auth-info', JSON.stringify(resp.data.result));
        this.$store.commit('updateAuthInfo');

        // redirect
        if ('redirect' in this.$route.query) {
          this.$router.push(this.$route.query.redirect);
          return;
        }
        this.$router.push('/');
      } catch (error) {
        ToastError(error);
      }
    },

    registerClick: function() {
      this.$router.push('/register');
    },
  },
};
</script>
