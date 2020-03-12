<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>Update {{entry.type}}</v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-text-field
                v-model="name"
                label="name"
                name="name"
                type="text"
                :prepend-icon="icon"
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

import { UpdateFolder, UpdateFile } from '@/api/v1/bottle';
import { Validations, MapErrors } from '@/util/validation';
import { ToastError, ToastSuccess } from '@/util/toast';

const validations = {
  name: {
    required,
    ...Validations.entryName,
  },
};

export default {
  props: ['value', 'entry'],

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

    icon: function() {
      if (this.entry.type === 'folder') return 'mdi-folder';
      return 'mdi-file';
    },
  },

  watch: {
    value: function() {
      this.name = this.entry.name;
    },
  },

  methods: {
    continueClick: async function() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      try {
        if (this.entry.type === 'folder') {
          await UpdateFolder({
            folder_id: this.entry.id,
            name: this.name,
            parent_id: this.entry.parent_id, // TODO: add `move` feature
          });
        } else {
          await UpdateFile({
            file_id: this.entry.id,
            name: this.name,
            folder_id: this.entry.folder_id,
          });
        }
        ToastSuccess('Success');

        this.$store.commit('fileChange');
        this.dialog = false;
        this.reset();
      } catch (error) {
        console.log(error);
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
