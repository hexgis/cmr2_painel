<template>
  <div v-if="loading">
    <v-skeleton-loader
      v-for="i in 3"
      :key="i"
      class="pa-2 mt-0 pt-0"
      type="text"
    />
  </div>
  <div v-else class="pb-6">
    <div
      v-for="category of layer.sublayers"
      :key="category.name"
      class="mt-n5"
    >
      <v-row class="mb-n12 mr-2 ml-1">
        <v-col class="d-flex align-center justify-end" cols="3">
          <v-card outlined color="transparent" class="my-card d-flex">
            <v-img
              :src="category.image"
              style="max-width: 100%; max-height: 100%"
              contain
            />
          </v-card>
        </v-col>

        <v-col
          class="d-flex align-center justify-start sub-layer-title"
          cols="6"
        >
          <v-card outlined color="transparent">
            {{ category.label }}
          </v-card>
        </v-col>
        <v-col cols="3" class="d-flex justify-start">
          <v-switch
            :input-value="category.visible"
            @change="setCql(category.name)"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<i18n>
{
    "en": {
        "legend": "legends"
    },
    "pt-br": {
        "legend": "legendas"
    }
}
</i18n>

<script>
import { mapMutations } from 'vuex'

export default {
  props: {
    layer: {
      type: Object,
      default: null,
    },
  },

  data: () => ({
    value: true,
    img: null,
    loading: false,
  }),

  mounted() {
    this.getCategory()
  },

  methods: {
    setCql(category) {
      this.setCqlLayer({
        id: this.layer.id,
        category,
      });
    },

        async getCategory() {
            try {
                this.loading = true
                const url = `${this.layer.wms.geoserver.wms_url}&service=WMS&version=1.1.0&request=GetLegendGraphic&layer=${this.layer.wms.geoserver_layer_namespace}:${this.layer.wms.geoserver_layer_name}&format=application/json`
                await this.$axios.get(url).then(({ data }) => {
                    if (
                        data.Legend &&
                        data.Legend[0] &&
                        data.Legend[0].rules.length > 1
                    ) {
                        const sublayers = {}
                        data.Legend[0].rules.forEach((fill, index) => {
                            if (fill.filter && fill.name) {
                                const cql = fill.filter.slice(1, -1)
                                const geomType = Object.keys(
                                    fill.symbolizers[0]
                                )[0]
                                const image =
                                    this.layer.wms.wms_layer_type ===
                                        'Point-Icon' && geomType !== 'Polygon'
                                        ? this.getImg(fill.symbolizers)
                                        : this.createImg(fill.symbolizers)
                                const label = this.capitalizeFirstLetter(
                                    fill.name.toLowerCase()
                                )
                                sublayers[`field${index}`] = {
                                    name: fill.name,
                                    label,
                                    visible: true,
                                    image,
                                    cql,
                                }
                            }
                            if (fill.filter && fill.title) {
                                const cql = fill.filter.slice(1, -1)
                                const geomType = Object.keys(fill.symbolizers[0])[0]
                                const image = this.layer.wms.wms_layer_type === 'Point-Icon' && geomType !== 'Polygon'
                                  ? this.getImg(fill.symbolizers)
                                  : this.createImg(fill.symbolizers)
                                const label = this.capitalizeFirstLetter(fill.title.toLowerCase())
                                sublayers[`field${index}`] = {
                                    name: fill.title,
                                    label,
                                    visible: true,
                                    image,
                                    cql,
                                }
                            }
                        })
                        this.setSublayers({
                            id: this.layer.id,
                            sublayers,
                        })
                    }
                })
            } catch (error) {
                console.error('Error fetching sublayers:', error)
                this.$store.commit(
                    'alert/addAlert',
                    {
                        message: this.$i18n.t('default-error', {
                            action: this.$i18n.t('retrieve'),
                            resource: this.$t('legend'),
                        }),
                    },
                    { root: true }
                )
            } finally {
                this.loading = false
            }
        },

        createImg(obj) {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            ctx.fillStyle =
                this.getColor(obj, 'fill') || this.getColor(obj, 'stroke')
            ctx.fillRect(50, 15, 150, 150)
            const dataURL = canvas.toDataURL('image/png')
            const img = new Image()
            img.src = dataURL
            document.body.appendChild(img)
            return img.src
        },

        getColor(obj, field) {
            const regex = new RegExp(`"${field}":"([^"]*)"`)
            const color = JSON.stringify(obj).match(regex)
            return color ? color[1] : null
        },

        getImg(obj) {
            const field = 'url'
            const regex = new RegExp(`"${field}":"([^"]*)"`)
            const image = JSON.stringify(obj).match(regex)
            return image ? image[1] : null
        },

    capitalizeFirstLetter(str) {
      if (str.toLowerCase() === 'encaminhada ri') {
        return 'Encaminhada RI';
      }
      return str.charAt(0).toUpperCase() + str.substring(1);
    },
    ...mapMutations('supportLayers', ['setCqlLayer', 'setSublayers']),
  },
}
</script>

<style scoped>
.my-card {
    height: 40px !important;
    width: 40px !important ;
}

.sub-layer-title {
    font-size: 14px;
    padding: 0px;
    line-height: 1;
}
</style>
