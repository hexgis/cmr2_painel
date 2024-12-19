<template>
  <div id="loading"></div>
</template>

<script>
export default {
    name: 'LoadingIcon'
}
</script>

<style scoped lang="sass">
    #loading
        width: 80px
        height: 80px
        border: 10px solid #f1f1f1
        border-top: 10px solid red
        margin: auto
        border-radius: 50%
        animation: spinner 1s linear infinite
    
    @keyframes spinner 
        to 
            transform: rotate(360deg)

</style>