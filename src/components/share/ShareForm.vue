<template>
  <v-form>
    <v-radio-group v-model="isTemp" row>
      <v-radio :value="false">
        <template v-slot:label>
          <div class="black--text">forever</div>
        </template>
      </v-radio>
      <v-radio :value="true">
        <template v-slot:label>
          <div class="black--text">temporary</div>
        </template>
      </v-radio>
    </v-radio-group>

    <v-row v-if="isTemp">
      <v-col>
        <v-text-field
          v-model="expire"
          label="expire"
          name="expire"
          :error-messages="expireErrors"
          @input="$v.expire.$touch()"
          @blur="$v.expire.$touch()"
        ></v-text-field>
      </v-col>
      <v-col cols="4">
        <v-select v-model="expUnit" :items="timeUnits"></v-select>
      </v-col>
    </v-row>

    <v-checkbox v-model="isPrivate">
      <template v-slot:label>
        <div class="black--text">Need a access code to your share</div>
      </template>
    </v-checkbox>

    <v-text-field
      v-model="accessCode"
      v-if="isPrivate"
      label="access code"
      name="code"
      prepend-icon="lock"
      type="text"
      :error-messages="accessCodeErrors"
      @input="$v.accessCode.$touch()"
      @blur="$v.accessCode.$touch()"
    ></v-text-field>
  </v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { Validations, MapErrors } from '@/util/validation';
import { AddNow } from '@/util/day';

const validations = {
  accessCode: { required, ...Validations.accessCode },

  expire: { required, ...Validations.expire },
};

export default {
  data: function() {
    return {
      timeUnits: ['hour', 'day'],

      expire: 1,
      expUnit: 'day',

      accessCode: '',

      isPrivate: true,
      isTemp: true,
    };
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

    accessCodeErrors: MapErrors('accessCode', validations.accessCode),

    expireErrors: MapErrors('expire', validations.expire),
  },

  validations,

  methods: {
    getFormData: function() {
      return {
        is_public: !this.isPrivate,
        exp: this.isTemp ? AddNow(this.expire, this.expUnit).unix() : 0,
        code: this.accessCode,
      };
    },

    reset: function() {
      this.isTemp = true;
      this.expire = 1;
      this.expUnit = 'day';
      this.isPrivate = true;
      this.accessCode = '';
      this.$v.$reset();
    },
  },
};
</script>
