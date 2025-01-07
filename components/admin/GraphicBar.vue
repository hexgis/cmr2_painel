<template>
  <div>
    <div class="full-bar">
      <div
        class="progress-bar"
        :style="[{ width: proportionalWidth, background: category.color}]"
      ></div>
    </div>
    <p><strong>{{category.total}}</strong> {{ category.label }}</p>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  data() {
    return {
      total: 0,
    };
  },
  props: {
    category: {},
    maxValue: {
      type: Number,
      required: true,
    },
  },
  mounted() {
    setTimeout(() => {
      this.total = this.category.total;
    }, 2000);
  },
  computed:{
    proportionalWidth(){
      return this.maxValue > 0
        ? `${(this.category.total / this.maxValue) * 100}%`
        : '0%'
    }
  }
};
</script>

<style scoped lang="sass">
.wrapper
  display: flex
  flex-direction: row
  align-items: center
  justify-content: space-between


.full-bar
  height: 7px
  background: #d9d9d9
  border-radius: 4px
  width: 100%

  .progress-bar
    height: 7px
    transition: width 3s ease
    border-radius: 4px


</style>
