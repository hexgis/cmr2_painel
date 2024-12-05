<template>
  <div>
    <HeroBanner
      :hero-title="$t('hero-title')"
      background-image="/img/portal/banner-projeto.jpg"
      :hasCTA=false
    />
    <div class="d-flex justify-sm-center">
    <v-row class="content">
      <v-col>
        <h2>{{ $t('hero-title')}}</h2>

        <div v-if="videoBlob">
            <video controls :src="videoUrl" style="width: 100%;"></video>
          </div>
          <p v-else>{{ $t('loading-video') }}</p>
      </v-col>
    </v-row>
  </div>
  </div>
</template>
<i18n>
  {
    "en": {
      "hero-title": "Welcome to CMR",
      "loading-video": "Loading video..."
    },
    "pt-br": {
      "hero-title": "Conheça o CMR",
      "loading-video": "Carregando vídeo..."
    }
  }
  </i18n>
<script>
import HeroBanner from '@/components/panel/HeroBanner'

export default {
  name: 'ComoFunciona',
  layout: 'portal',
  components: {
    HeroBanner
  },
  data() {
    return {
      videoUrl: null,
      videoBlob: null
    }
  },
  created(){
    this.fetchVideo()
  },
  methods: {
    async fetchVideo() {
      try {
        const response = await this.$api.get('/portal/video', { responseType: 'blob' })
        this.videoBlob = response.data
        this.videoUrl = URL.createObjectURL(this.videoBlob)
      } catch (error) {
        console.error('Erro ao carregar o vídeo:', error)
      }
    }
  },
  beforeDestroy() {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl)
    }
  }

}
</script>

<style lang="sass">
h2
  font-size: 24px
  padding-bottom: 2rem

h3
  font-size: 22px
  padding: 2rem 0
  color: #F58A1F

.content
  align-items: flex-start
  max-width: 1100px
  gap: 1rem
</style>
