<template>
    <NuxtLink :to="getUrl">
        <v-card class="card">
            <v-icon color="#F58A1F" size="40">{{ props.icon }}</v-icon>
            <p class="text-uppercase">{{ props.optionLabel }}</p>
        </v-card>
    </NuxtLink>
</template>

<script>
export default {
    name: 'FullCard',
    props: {
        props: {
            type: Object,
            required: true,
        },
    },
    computed: {
        getUrl() {
            return this.localePath(`/admin/${this.props.url}`)
        },
    },
}
</script>

<style lang="sass" scoped>
p
  margin-bottom: 0
  align-content: center

a
  text-decoration: none

.card
  display: flex
  align-content: center
  gap: 1rem
  width: 100%
  padding: 1rem 0.5rem
  margin-bottom: 1rem
  border-radius: 8px
  background: #fff
  cursor: pointer
</style>
