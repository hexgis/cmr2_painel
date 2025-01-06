<template>
    <component :is="viewsChartComponent" />
</template>

<script>
export default {
    data() {
        return {
            viewsChartComponent: null,
        }
    },
    created() {
        if (typeof window !== 'undefined') {
            this.loadViewsChart()
        } else {
            this.checkWindowAvailability()
        }
    },
    methods: {
        loadViewsChart() {
            import('~/components/analytics/ViewsChart.vue')
                .then((module) => {
                    this.viewsChartComponent = module.default
                })
                .catch((error) => {
                    console.error('Failed to load ViewsChart component:', error)
                })
        },
        checkWindowAvailability() {
            const intervalId = setInterval(() => {
                if (typeof window !== 'undefined') {
                    clearInterval(intervalId)
                    this.loadViewsChart()
                }
            }, 100)
        },
    },
    layout: 'fullPage',
}
</script>

<style></style>
