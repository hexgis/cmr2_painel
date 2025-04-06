<template>
    <v-app id="main-page">
        <v-main>
            <div>
                <v-icon class="ma-2 btn-back" @click="$router.back()">
                    mdi-arrow-left
                </v-icon>
                <nuxt />
            </div>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    head: () => ({
        title: 'CMR',
    }),
}
</script>

<style scoped lang="sass">
#main-page
  height: 100vh
  overflow-y: auto
  overflow-x: hidden

  .btn-back
    cursor: pointer
    position: absolute
    top: 15px
    left: 15px
    z-index: 100
</style>
