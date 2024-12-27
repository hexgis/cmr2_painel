<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :items-per-page="10"
    fixed-header
    hide-default-footer
    height="fit-content"
  >
    <template v-slot:body="{ items }">
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
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
    },
    dailyCounts: {
      type: Object,
    },
    total: {
      type: Boolean,
    }
  },
  computed: {
    ...mapGetters('charts', ['getTotalViewsPerYear']),
    headers() {
      return this.labels.map(label => ({ text: label, value: label.toLowerCase() }));
    },
    items() {
      return this.computeItems();
    }
  },
  methods: {
    computeItems() {
      const monthlyItems = this.monthlyCounts ? this.monthlyCounts.map(monthly => ({
        date: `${monthly.month < 10 ? '0' + monthly.month : monthly.month}/${monthly.year}`,
        count: monthly.count
      })) : [];

      if (this.total && this.getTotalViewsPerYear) {
        this.getTotalViewsPerYear.forEach(item => {
          item.yearly_totals.forEach(yearlyTotal => {
            const date = `Total de acessos em ${yearlyTotal.year}:`;

            if (!monthlyItems.some(existingItem =>
              existingItem.date === date &&
              existingItem.count === yearlyTotal.count)) {

              monthlyItems.push({ date, count: yearlyTotal.count });
            }
          });
        });
      }

      const dailyItems = this.dailyCounts ? Object.keys(this.dailyCounts).map(date => ({
        date: `${date}`,
        count: this.dailyCounts[date]
      })) : [];

      return [...monthlyItems, ...dailyItems];
    }
  },
  watch: {
    getTotalViewsPerYear: 'computeItems',
    monthlyCounts: 'computeItems',
    dailyCounts: 'computeItems'
  }
};
</script>

<style scoped>
  .table--row {
    border-bottom: 1px solid #00000020;
    padding: 0.2rem 0;
  }
</style>
