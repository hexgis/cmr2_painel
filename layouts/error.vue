<template>
  <v-app dark>
    <h1 v-if="error.statusCode === 404">
      {{ $t('page-not-found') }}
    </h1>
    <h1 v-else>
      {{ $t('other-error') }}
    </h1>
    <NuxtLink :to="localePath('/')">
      {{ $t('home-page') }}
    </NuxtLink>
  </v-app>
</template>

<i18n>
{
    "en": {
        "home-page": "Home page",
        "page-not-found": "404 Not Found",
        "other-error": "An error occurred"
    },
    "pt-br": {
        "home-page": "Página inicial",
        "page-not-found": "404 Não Encontrado",
        "other-error": "Ocorreu um erro"
    }
}
</i18n>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  head() {
    const title = this.error.statusCode === 404
      ? this.$t('page-not-found')
      : this.$t('other-error');
    return {
      title,
    };
  },
};
</script>

<style scoped>
h1 {
    font-size: 20px;
}
</style>
