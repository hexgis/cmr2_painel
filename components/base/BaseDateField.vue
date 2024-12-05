<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="slide-y-transition"
    offset-y
    max-width="290px"
  >
    <template #activator="{ on }">
      <v-text-field
        v-model="formatted"
        v-mask="month ? $t('month-mask') : $t('date-mask')"
        :label="label"
        :dense="dense"
        :rounded="rounded"
        :solo="solo"
        :filled="filled"
        :outlined="outlined"
        prepend-inner-icon="mdi-calendar"
        :required="required"
        :rules="rules"
        v-on="on"
        @blur="updateModel"
        @input="menu = false"
      />
    </template>
    <v-date-picker
      v-model="model"
      :type="month ? 'month' : 'date'"
      :locale="$i18n.locale"
      no-title
      :min="minDate"
      :max="maxDate || $moment().format('YYYY-MM-DD')"
      @input="menu = false"
    />
  </v-menu>
</template>

<i18n>
{
    "en": {
        "invalid-date": "Invalid date",
        "date-format": "YYYY-MM-DD",
        "date-mask": "####-##-##",
        "month-format": "YYYY-MM",
        "month-mask": "####-##",
        "requested": "Requested"
    },
    "pt-br": {
        "invalid-date": "Data inválida",
        "date-format": "DD/MM/YYYY",
        "date-mask": "##/##/####",
        "month-format": "MM/YYYY",
        "month-mask": "##/####",
        "requested": "Obrigatório"
    }
}
</i18n>

<script>
export default {
  name: 'BaseDateField',

  props: {
    label: {
      type: String,
      default: 'Data',
    },
    value: {
      type: String,
      default: '',
    },
    minDate: {
      type: String,
      default: '',
    },
    maxDate: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    month: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    menu: false,
    model: '',
    formatted: '',
    rules: [],
  }),

  watch: {
    model(value) {
      if (value && value.length) {
        this.formatted = this.format(this.$moment(value));
      }
      this.$emit('input', this.model);
    },

    minDate() {
      if (this.model && this.minDate > this.model) {
        this.model = this.minDate;
      }
    },

    maxDate() {
      if (this.model && this.model > this.maxDate) {
        this.model = this.maxDate;
      }
    },
  },

  created() {
    if (
      (!this.month && this.$moment(this.value, 'YYYY-MM-DD').isValid())
            || (this.month && this.$moment(this.value, 'YYYY-MM').isValid())
    ) {
      this.model = this.value;
      this.formatted = this.format(this.$moment(this.value));
    }
  },

  mounted() {
    if (this.required) {
      this.rules.push(() => !!this.formatted || this.$t('requested'));
    }
    this.rules.push(
      () => (this.month
        ? this.$moment(
          this.formatted,
          this.$t('month-format'),
        ).isValid()
        : this.$moment(
          this.formatted,
          this.$t('date-format'),
        ).isValid()) || this.$t('invalid-date'),
    );
  },

  methods: {
    updateModel() {
      if (!this.month) {
        if (
          this.$moment(
            this.formatted,
            this.$t('date-format'),
          ).isValid()
        ) {
          this.model = this.$moment(
            this.formatted,
            this.$t('date-format'),
          ).format('YYYY-MM-DD');
        } else {
          this.model = '';
        }
      } else if (
        this.$moment(this.formatted, this.$t('month-format')).isValid()
      ) {
        this.model = this.$moment(
          this.formatted,
          this.$t('month-format'),
        ).format('YYYY-MM');
      } else {
        this.model = '';
      }
    },

    format(date) {
      return this.month
        ? date.format(this.$t('month-format'))
        : date.format(this.$t('date-format'));
    },
  },
};
</script>
