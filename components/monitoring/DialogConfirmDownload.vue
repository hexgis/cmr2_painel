<template>
    <v-dialog v-model="dialog" persistent max-width="500">
        <template v-slot:activator="{ on, attrs }">
            <v-tooltip left>
                <template
                    v-slot:activator="{ on: onTooltip, attrs: attrsTooltip }"
                >
                    <v-btn
                        color="primary"
                        icon
                        small
                        :loading="isLoadingGeoJson"
                        dark
                        v-bind="{ ...attrsTooltip, ...attrs }"
                        v-on="{ ...onTooltip, ...on }"
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
            <v-card-text class="mt-4" style="text-align: justify;">
                {{ $t('description-label') }}
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
        "description-label": "Results will be limited to 10,000 features and not all polygons will be available in the generated file."        
    },
    "pt-br": {
        "attention-label": "Atenção",
        "download-label": "Baixar",
        "cancel-label": "Cancelar",
        "description-label": "Os resultados serão limitados a 10.000 feições e nem todos os polígonos estarão disponíveis no arquivo gerado."
    }
}
</i18n>

<script>
import { mapMutations, mapState, mapActions } from 'vuex'

export default {
    name: 'DialogConfirmDownload',

    props: {
        // dialog: {
        //     type: Boolean,
        //     default: false,
        // },
    },

    data() {
        return {
            dialog: false,
        }
    },

    computed: {
        ...mapState('monitoring', ['isLoadingGeoJson']),
    },

    methods: {
        download() {
            this.$store.dispatch('monitoring/downloadGeoJsonMonitoring')
            this.dialog = false
        },
    },
}
</script>

