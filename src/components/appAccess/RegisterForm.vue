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
          v-model="username"
          label="username"
          name="username"
          prepend-icon="person"
          type="text"
          :error-messages="usernameErrors"
          required
          @input="$v.username.$touch()"
          @blur="$v.username.$touch()"
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
        <v-text-field
          v-model="confirmPassword"
          label="confirm password"
          name="confirmPassword"
          prepend-icon="mdi-lock-outline"
          type="password"
          :error-messages="confirmPasswordErrors"
          required
          @input="$v.confirmPassword.$touch()"
          @blur="$v.confirmPassword.$touch()"
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn color="primary" @click="loginClick" text>
        <v-icon left>mdi-arrow-left</v-icon>Login
      </v-btn>

      <v-btn color="primary" @click="registerClick">Register</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import {
  required,
  email,
  maxLength,
  minLength,
  sameAs,
} from 'vuelidate/lib/validators';

import { Register } from '@/api/v1/auth';

export default {
  data: function() {
    return {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    };
  },

  validations: {
    email: {
      required,
      email,
    },
    username: {
      required,
      maxLength: maxLength(24),
      minLength: minLength(4),
    },
    password: {
      required,
      maxLength: maxLength(18),
      minLength: minLength(6),
    },
    confirmPassword: {
      required,
      sameAs: sameAs('password'),
    },
  },

  computed: {
    emailErrors: function() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.required && errors.push('Email is required');
      !this.$v.email.email && errors.push('Invalid email');
      return errors;
    },

    usernameErrors: function() {
      const errors = [];
      if (!this.$v.username.$dirty) return errors;
      !this.$v.username.required && errors.push('username is required');
      !this.$v.username.maxLength && errors.push('username is too long');
      !this.$v.username.minLength && errors.push('username is too short');
      return errors;
    },

    passwordErrors: function() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.required && errors.push('Password is required');
      !this.$v.password.maxLength && errors.push('Password is too long');
      !this.$v.password.minLength && errors.push('Password is too short');
      return errors;
    },

    confirmPasswordErrors: function() {
      const errors = [];
      if (!this.$v.confirmPassword.$dirty) return errors;
      !this.$v.confirmPassword.required &&
        errors.push('ConfirmPassword is required');
      !this.$v.confirmPassword.sameAs &&
        errors.push('ConfirmPassword should be same as password');
      return errors;
    },
  },

  methods: {
    registerClick: async function() {
      if (this.$v.$touch() && this.$v.$invalid) {
        return;
      }
      try {
        const resp = await Register(this.$data);
        this.$toast.success(resp.data);
        this.$router.push('login');
      } catch (error) {
        this.$toast.error(error.msg);
      }
    },

    loginClick: function() {
      this.$router.push('/login');
    },
  },
};
</script>