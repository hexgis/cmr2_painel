<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :items-per-page="10"
    fixed-header
    hide-default-footer
    height="fit-content"
  >
    <template #body="{ }">
      <tbody>
        <tr
          v-for="(item, index) in items"
          :key="index"
        >
          <td>{{ item.date }}</td>
          <td>{{ item.count }}</td>
        </tr>
      </tbody>
    </template>
  </v-data-table>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    labels: {
      type: Array,
      required: true,
    },
    monthlyCounts: {
      type: Array,
      default: () => [],
    },
    dailyCounts: {
      type: Object,
      default: () => ({}),
    },
    total: {
      type: Boolean,
      default: false,
    },
    institutionType: {
      type: String,
      default: 'AGÊNCIAS',
    },
  },
  computed: {
    ...mapGetters('charts', ['getTotalViewsPerYear', 'getInstitutionFilter']),
    headers() {
      return this.labels.map((label) => ({ text: label, value: label.toLowerCase() }));
    },
    items() {
      return this.computeItems();
    },
  },
  watch: {
    getTotalViewsPerYear: {
      handler: 'computeItems',
      deep: true,
    },
    monthlyCounts: {
      handler: 'computeItems',
      deep: true,
    },
    dailyCounts: {
      handler: 'computeItems',
      deep: true,
    },
    institutionType: {
      handler: 'computeItems',
      immediate: true,
    },
  },
  methods: {
    computeItems() {
      const monthlyItems = this.monthlyCounts
        ? this.monthlyCounts
          .filter((monthly) => Number.isInteger(monthly.month) && Number.isInteger(monthly.year))
          .map((monthly) => {
            const monthStr = monthly.month < 10 ? `0${monthly.month}` : `${monthly.month}`;
            const yearStr = `${monthly.year}`;
            return {
              date: `${monthStr}/${yearStr}`,
              count: monthly.count || 0,
            };
          })
        : [];

      if (this.total && Array.isArray(this.getTotalViewsPerYear)) {
        this.getTotalViewsPerYear.forEach((yearlyTotal) => {
          if (yearlyTotal && Number.isInteger(yearlyTotal.year)
          && yearlyTotal.count !== undefined) {
            const date = `Total de acessos em ${yearlyTotal.year}:`;
            if (
              !monthlyItems.some(
                (existingItem) => existingItem.date === date
                 && existingItem.count === yearlyTotal.count,
              )
            ) {
              monthlyItems.push({ date, count: yearlyTotal.count });
            }
          }
        });
      }

      const dailyItems = this.dailyCounts
        ? Object.keys(this.dailyCounts).map((date) => ({
          date: `${date}`,
          count: this.dailyCounts[date],
        }))
        : [];

      return [...monthlyItems, ...dailyItems];
    },
  },
};
</script>

<style scoped>
.table--row {
  border-bottom: 1px solid #00000020;
  padding: 0.2rem 0;
}
</style>
