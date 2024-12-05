<template>
    <div>
          <l-geo-json
            v-if="indigenousLand"
            ref="interestArea"
            :geojson="indigenousLand"
            :options-style="interestStyle"
        />
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    data: () => ({
        interestStyle: {
            fillOpacity: 0.5,
            fill: true,
        },
    }),

    computed: {
        ...mapState('map', ['indigenousLand']),
    },

    
}
</script>