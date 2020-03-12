<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>Modify share</v-card-title>
        <v-card-text class="red--text font-weight-medium">
          <share-form ref="form"></share-form>
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
import { ModifyShare } from '@/api/v1/share';
import { ToastError, ToastSuccess } from '@/util/toast';

export default {
  props: ['value', 'token'],

  computed: {
    dialog: {
      get: function() {
        return this.value;
      },
      set: function(value) {
        this.$emit('input', value);
      },
    },

    form: function() {
      return this.$refs.form;
    },
  },

  components: {
    ShareForm: () => import('@/components/share/ShareForm.vue'),
  },

  methods: {
    continueClick: async function() {
      this.form.$v.$touch();
      if (
        (this.form.isPrivate && this.form.$v.accessCode.$invalid) ||
        (this.form.isTemp && this.form.$v.expire.$invalid)
      ) {
        console.log('invalid form');
        return;
      }

      try {
        await ModifyShare({
          token: this.token,
          ...this.form.getFormData(),
        });
        this.$emit('refresh');
        ToastSuccess('Modify successfully');
        this.dialog = false;
      } catch (error) {
        ToastError(error);
      }
    },

    cancelClick: function() {
      this.dialog = false;
    },
  },
};
</script>

<style>
</style>