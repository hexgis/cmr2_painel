<template>
    <div class="d-flex flex-row mb-0.5 ml-1">
        <v-expand-x-transition>
            <div v-show="confirmAction === true" class="overflow-hidden">
                <div class="d-flex flex-row slide-button-area">
                    <v-btn icon class="cancel" @click="confirmAction = false">
                        <v-icon size="50">mdi-close-circle-outline</v-icon>
                    </v-btn>
                    <v-btn icon class="confirm" @click="confirm()">
                        <v-icon size="50"
                            >mdi-check-circle-outline</v-icon
                        ></v-btn
                    >
                </div>
            </div>
        </v-expand-x-transition>
        <div v-show="confirmAction !== true">
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        class="button-icon"
                        v-bind="attrs"
                        @click="confirmAction = true"
                        v-on="on"
                    >
                        <v-icon size="50">{{ icon }}</v-icon>
                    </v-btn>
                </template>
                <span> {{ iconTooltip }}</span>
            </v-tooltip>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        icon: {
            type: String,
            required: true,
        },
        iconTooltip: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            confirmAction: {
                type: Boolean,
                default: false,
            },
        }
    },
    methods: {
        confirm() {
            this.confirmAction = false
            this.$emit('confirm')
        },
    },
}
</script>
<style scoped lang="sass">
.button-icon
    color: #31383A !important

.slide-button-area
    background-color: whitesmoke
    border-radius: 20px
    box-shadow: 1px 1px 1px inset lightgray

.cancel
    color: rgba(255, 65, 54) !important

.cancel:hover
    color: rgba(255, 65, 54) !important

.confirm
    color: rgb(46, 204, 64) !important

.confirm:hover
    color: rgb(46, 204, 64) !important
</style>
