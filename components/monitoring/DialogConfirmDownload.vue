<template>
    <v-dialog v-model="dialog" persistent max-width="500">
        <template v-slot:activator="{ on, attrs }">
            <v-tooltip left>
                <template
                    v-slot:activator="{ on: onTooltip, attrs: attrsTooltip }"
                >
                    <v-btn
                        v-if="table"
                        small
                        fab
                        class="mx-2 my-2"
                        color="secondary"
                        :loading="isLoadingGeoJson || isLoadingDownloadTableMonitoring"
                        @click="startDownload"
                    >
                        <v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-btn
                        v-else
                        color="primary"
                        icon
                        small
                        :loading="isLoadingGeoJson"
                        dark
                        v-bind="{ ...attrsTooltip }"
                        v-on="{ ...onTooltip }"
                        @click="startDownload"
                    >
                        <v-icon>mdi-download</v-icon>
                    </v-btn>
                </template>
                <span>{{ $t('download-label') }}</span>
            </v-tooltip>
        </template>

        <v-card>
            <v-card-title class="text-h6">
                {{ $t('attention-label') }}

                <v-spacer></v-spacer>

                <v-btn icon @click="dialog = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-card-text class="mt-4" style="text-align: justify">
                <p>
                    {{ $t('description-label-1') }}
                </p>
                <p>
                    {{ $t('description-label-2') }}
                    <a href="mailto:cmr@funai.gov.br">cmr@funai.gov.br</a>.
                </p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="dialog = false">
                    <v-icon>mdi-close</v-icon>
                    {{ $t('cancel-label') }}
                </v-btn>
                <v-btn
                    color="green darken-1"
                    :loading="isLoadingGeoJson"
                    text
                    @click="download"
                >
                    <v-icon>mdi-download</v-icon>
                    {{ $t('download-label') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<i18n>
{
    "en": {
        "attention-label": "Attention",
        "download-label": "Download",
        "cancel-label": "Cancel",
        "description-label-1": "Due to technical limitations, the generated file has a maximum limit of 10,000 features. The query made generated a number of polygons greater than that, so it is possible that not all polygons will be available in the generated file.",
        "description-label-2": "If you need to download the complete data, please contact the CMR team via Contact Us on the platform or by email "
    },
    "pt-br": {
        "attention-label": "Atenção",
        "download-label": "Baixar",
        "cancel-label": "Cancelar",
        "description-label-1": "Devido a limitações técnicas, os arquivo gerado possui o limite máximo de 10.000 feições. A consulta efetuada gerou um número superior de polígonos, de forma que é possível nem todos os polígonos estarão disponíveis no arquivo gerado.",
        "description-label-2": "Em caso de necessidade de download dos dados completos, entre em contato com a equipe da CMR por meio do Fale Conosco na plataforma ou pelo e-mail "
    }
}
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex'

export default {
    name: 'DialogConfirmDownload',

    props: {
        table: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        return {
            dialog: false,
        }
    },

    computed: {
        ...mapState('monitoring', ['isLoadingGeoJson', 'isLoadingDownloadTableMonitoring']),
    },

    methods: {
        async startDownload() {
            try {
                this.$store.commit('monitoring/setLoadingGeoJson', true)

                const numberOfFeatures = await this.$store.dispatch(
                    'monitoring/checkHitsDownloadGeojsonMonitoring'
                )

                if (numberOfFeatures && numberOfFeatures > 10000) {
                    this.dialog = true
                } else {
                    this.download()
                }
            } catch (error) {
                console.error('Error downloading GeoJSON:', error)
            } finally {
                this.$store.commit('monitoring/setLoadingGeoJson', false)
            }
        },

        download() {
            if (this.table)
                this.$store.dispatch('monitoring/downloadTableMonitoring')
            else this.$store.dispatch('monitoring/downloadGeoJsonMonitoring')
            this.dialog = false
        },
    },
}
</script>

