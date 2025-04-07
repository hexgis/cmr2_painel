<template>
    <div id="flags" class="locale-changer">
        <span class="pa-1 ma-1">{{ $t('selectLocale') }}</span>
        <div class="flag-container">
            <a v-for="locale in locales" :key="locale.code" :href="locale.url">
                <div class="flag-shape" :title="locale.name">
                    <p class="text-uppercase">{{ locale.code }}</p>
                </div>
            </a>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            locales: [
                { code: 'pt', name: 'Português (Brasil)', flag: "/img/brasil-flag.svg", url: "/" },
                { code: 'eng', name: 'English (USA)', flag: "/img/usa-flag.svg", url: "/en/" }
            ]
        };
    },
    watch: {
        '$root.$i18n.locale'(newLocale) {
            if (newLocale === 'en') {
                this.$router.push('/en/');
                this.$i18n.locale(newLocale);
            }
            this.$router.push('/');
            this.$i18n.locale('pt-br');
        }
    }
}

</script>

<i18n>
  {
      "en": {
          "selectLocale": "Select language:"
      },
      "pt-br": {
         "selectLocale": "Selecione o idioma:"
      }
  }
</i18n>

<style lang="sass" scoped>
  a
    text-decoration: none

  .locale-changer
    display: flex
    color: white
    align-content: center
    justify-content: center
    opacity: 0.4
    transition: all ease-in-out 0.3s
    border-radius: 24px

    &:hover
      opacity: 1
      border: 1px solid #ffffff

  .flag
    &-container
      display: flex

    &-shape
      width: 40px
      height: 40px
      display: flex
      justify-content: center
      align-items: center
      border-radius: 50%
      margin-left: 0.5rem

      p
        color: #FFFFFF
        font-weight: bold
        margin-bottom: 0

      &:hover
       background: #D92B3F
  </style>
