import messages from './plugins/i18n-messages.js';

require('dotenv').config();

export default {
  // Outras configurações...
  // serverMiddleware: [
  //   { path: '/api', handler: '~/server-middleware/express.js' },
  // ],

  mode: 'universal',
  /*
     ** Headers of the page
     */
  head: {
    titleTemplate: `%s - ${process.env.APP_NAME}`,
    title: 'CMR' || '',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
     ** Customize the progress-bar color
     */
  loading: { color: '#C2293D', height: '4px' },
  /*
     ** Global CSS
     */
  css: ['@mdi/font/css/materialdesignicons.css'],
  /*
     ** Plugins to load before mounting the App
     */
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/filters.js',
    '~/plugins/v-mask.js',
    '~/plugins/i18n.js',
    { src: '~/plugins/vue-chartjs.js', mode: 'client' },
    { src: '~/plugins/vue2-leaflet-markercluster.js', mode: 'client' },
  ],
  /*
     ** Nuxt.js dev-modules
     */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
    '@nuxtjs/moment',
  ],

  /*
     ** Nuxt.js modules
     */
  modules: [
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    'nuxt-leaflet',
    'cookie-universal-nuxt',
    'nuxt-i18n',
  ],
  /*
     ** vuetify module configuration
     ** https://github.com/nuxt-community/vuetify-module
     */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      light: true,
      dark: false,
      themes: {
        light: {
          primary: '#D92B3F', // vermelho - botão login, faixa login, loading login
          secondary: '#D92B3F', // vermelho
          accent: '#D92B3F', // vermelho
          error: '#da2a3f',
          warning: '#FFCE03', // amarelo
          info: '#FFFFFF', // branco - fundo login
          success: '#26A69A',
          btn_login: '#D92B3F',
        },
        dark: {
          primary: '#D92B3F', // vermelho
          secondary: '#D92B3F', // vermelho
          accent: '#D92B3F', // vermelho
          error: '#2F4D6A',
          warning: '#FFCE03', // amarelo
          info: '#000000', // preto fundo login
          success: '#26A69A',
        },
      },
    },
  },

  i18n: {
    vueI18nLoader: true,
    locales: ['pt-br', 'en'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages,
    },
  },

  moment: {
    locales: ['pt-br'],
    defaultLocale: 'en',
  },
  /*
     ** Build configuration
     */
  build: {
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map';
      }
    },
  },

  router: {
    middleware: 'auth',
  },
};
