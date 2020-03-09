<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title>Create folder</v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-text-field
                v-model="name"
                label="name"
                name="name"
                type="text"
                prepend-icon="mdi-folder"
                :error-messages="nameErrors"
                required
                @input="$v.name.$touch()"
                @blur="$v.name.$touch()"
              ></v-text-field>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="continueClick">Continue</v-btn>
          <v-btn color="black" text @click="cancelClick">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

import { CreateFolder } from '@/api/v1/bottle';
import { Validations, MapErrors } from '@/util/validation';
import { ToastError, ToastSuccess } from '@/util/toast';

const validations = {
  name: {
    required,
    ...Validations.entryName,
  },
};

export default {
  props: ['value', 'parent_id'],

  data: function() {
    return {
      name: '',
    };
  },

  validations: validations,

  computed: {
    dialog: {
      get: function() {
        return this.value;
      },
      set: function(value) {
        this.$emit('input', value);
        this.$v.$reset();
        this.name = '';
      },
    },

    nameErrors: MapErrors('name', validations.name),
  },

  methods: {
    continueClick: async function() {
      try {
        await CreateFolder({
          name: this.name,
          parent_id: this.parent_id,
        });
        ToastSuccess('Success');

        this.$emit('refresh');
        this.dialog = false;
        this.reset();
      } catch (error) {
        ToastError(error);
      }
    },

    cancelClick: function() {
      this.dialog = false;
      this.reset();
    },

    reset: function() {
      this.$v.$reset();
      this.name = '';
    },
  },
};
</script>
