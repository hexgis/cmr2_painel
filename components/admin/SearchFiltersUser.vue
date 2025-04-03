<template>
    <v-row>
        <v-col cols="12" sm="6" md="4">
            <v-text-field
                v-model="filters.name"
                :label="$t('name')"
                type="string"
                clearable
            />
        </v-col>
        <v-col cols="12" sm="6" md="4">
            <v-text-field
                v-model="filters.email"
                :label="$t('email')"
                clearable
            />
        </v-col>
    </v-row>
</template>

<i18n>
  {
  "en": {
    "name": "Name",
    "email": "E-mail"
  },
  "pt-br": {
    "name": "Nome",
    "email": "E-mail"
  }
}
</i18n>

<script>
export default {
    props: {
        filters: Object,
    },
}
</script>
