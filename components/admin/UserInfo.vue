<template>
  <div v-if="user">
    <p class="light--text">Servidor</p>
    <p class="text-h5 font-weight-bold">{{ user.name }}</p>
    <div class="d-flex align-center flex-lg-row">
      <span>
        <p>{{ user.email }}</p>
        <p>{{ user.department }}</p>
      </span>
      <span class="vertical-separator ml-5">
        <p class="light--text">Matrícula SIAPE</p>
        <p>{{ user.user_siape_registration }}</p>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInfo',
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
};
</script>
<style lang="sass" scoped>
p
  margin: 0

.vertical-separator
  border-left: 1px solid #9A9997
  padding-left: 1rem

.light--text
  color: #9A9997
  font-size: 12px
</style>
