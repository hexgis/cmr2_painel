<template>
    <div>
        <v-card class="text-uppercase card">
            <p class="text--lightgray">{{ label }}</p>
            <h4>{{ cardName }}</h4>
            <hr class="mb-4 mt-4" />
        </v-card>
        <CustomDialog
            v-model="dialog"
            title="Editar"
            :hasCta="true"
            :saveActive="true"
            width="800px"
        >
            <v-text-field
                class="pt-8"
                v-model="cardName"
                hide-details="auto"
                :label="label"
            />
        </CustomDialog>
    </div>
</template>

<script>
import CustomDialog from './CustomDialog.vue'


export default {
    components: { CustomDialog},
    props: {
        card: {
            type: Object,
            required: true,
        },
        label: {
            type: String,
            default: 'Instituição',
        },
       
        from: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            dialog: false,
            isSelected: false,
            localCardDescription: '',
        }
    },
   
    computed: {
        cardName() {
            return this.card.roles
                ? this.card.name || this.card.roles[0].name
                : this.card.name
        },
    },
}
</script>

<style lang="sass" scoped>
p
  margin-bottom: 0

.card
  width: 100%
  min-width: 350px
  min-height: 100px
  border-radius: 8px
  background: #fff
  padding: 1.5rem
  position: relative
  cursor: pointer

.text--lightgray
  color: #9A9997
  font-size: 12px

.icon
  position: absolute
  top: 10px
  right: 20px
  z-index: 10

.overlay
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  display: flex
  justify-content: center
  align-items: center
  background: #D92B3F46
  z-index: 15
</style>
