<template>
    <div class="chart">
        <div class="chart-header elevated">
            <v-img class="m-auto flex chart-header-logo" :src="logo_funai" />
        </div>
        <div class="pa-md-4 mx-lg-auto">
            <v-container fluid>
                <v-row align="center" class="column" justify="space-around">
                    <v-col class="mt-7">
                        <v-row>
                            <v-col>
                                <BaseDateField label="Data de início" :required="true" outlined />
                            </v-col>
                            <v-col>
                                <BaseDateField
                                    label="Data de fim"
                                    :required="true"
                                    flex-row
                                    outlined
                                />
                            </v-col>
                        </v-row>
                        <v-btn block color="secondary" @click="search()"> Pesquisar </v-btn>
                    </v-col>
                </v-row>
            </v-container>

            <p>Últimos Acessos</p>
            <LineChartViews />
            <BarChartDefault />
            <v-row>
                <v-col>
                    <p>Mapa com a localização de acesso dos usuários</p>
                    <DoughnutChartViews />
                </v-col>
                <v-col>
                    <p>Tipo de navegador utilizado</p>
                    <PieChartView />
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <p>TABLE 2</p>
                </v-col>
                <v-col>
                    <v-table theme="dark">
                        <thead>
                            <tr>
                                <th class="text-left">Name</th>
                                <th class="text-left">Calories</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in getData" :key="getData">
                                <td>{{ item.monthly_counts.total }}</td>
                                <td>{{ item.monthly_counts.total }}</td>

                            </tr>
                        </tbody>
                    </v-table>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BarChartDefault from '@/components/graphics/dashboard/BarChartDefault.vue'
import DoughnutChartViews from '@/components/graphics/dashboard/DoughnutChart.vue'
import LineChartViews from '@/components/graphics/dashboard/LineChartViews.vue'
import PieChartView from '@/components/graphics/dashboard/PieChart.vue'
import RadarChart from '@/components/graphics/RadarChart.vue'
import BaseDateField from '@/components/base/BaseDateField.vue'

export default {
    name: 'ViewsChartPage',
    layout: 'analytics',
    components: {
        BarChartDefault,
        DoughnutChartViews,
        LineChartViews,
        PieChartView,
        RadarChart,
        BaseDateField,
    },
    data: () => ({
        logo_funai: process.env.DEFAULT_LOGO_IMAGE_CMR,
        activatorProps: false,
    }),
    mounted: {
      getData(){
        return this.getDataChart
      }
    },
    computed: {
        isDateSelected() {
            return !!this.startDate && !!this.endDate
        },
        ...mapGetters('charts', [
            'getDataChart',
            'getDates',
            'getDateCounts',
            'getTypeDeviceCounts',
            'getBrowserCounts',
        ]),
    },
}
</script>

<style scoped lang="sass">
.chart
  position: sticky
  top: 0
  z-index: 3

  &-header
    position: sticky
    top: 0
    padding: 0.5rem
    background: #f1f1f1
    z-index: 333

    &-logo
      width: 15rem
      margin: 0 auto

.container-iframe
    display: inline-block
    width: 100%
    height: 100vh
    border: 0
</style>
