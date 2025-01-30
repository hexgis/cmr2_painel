<template>
    <div>
        <v-card class="text-uppercase card" @click="toggleSelection">
            <p class="text--lightgray">{{ label }}</p>
            <h4>{{ cardName }}</h4>
            <hr class="mb-4 mt-4" />
            <p class="text--lightgray">Tipo</p>
            <p>{{ card.description }}</p>
            <v-icon class="icon" @click.stop="editCard">mdi-pencil</v-icon>
        </v-card>
        <CustomDialog
            v-model="dialog"
            title="Editar"
            :hasCta="true"
            @save="saveCard"
            :saveActive="true"
            width="800px"
        >
            <v-text-field
                class="pt-8"
                v-model="cardName"
                hide-details="auto"
                :label="label"
            />
            <v-text-field
                class="pt-8"
                v-model="localCardDescription"
                hide-details="auto"
                label="Descrição"
            />
            <PermissionManager
                :grantedPermissions="grantedPermissions"
                :revokedPermissions="revokedPermissions"
                @update-permissions="$emit('update-permissions', $event)"
            />
        </CustomDialog>
    </div>
</template>

<script>
import CustomDialog from './CustomDialog.vue'
import PermissionManager from './PermissionManager.vue'

export default {
    components: { CustomDialog, PermissionManager },
    props: {
        card: {
            type: Object,
            required: true,
        },
        label: {
            type: String,
            default: 'Grupo',
        },
        isPermissionChanged: {
            type: Boolean,
            default: false,
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
            grantedPermissions: [],
            revokedPermissions: [],
            localCardDescription: '',
        }
    },
    watch: {
      card: {
        handler(newVal) {
          this.localCardDescription = newVal.description;
        },
        deep: true,
        immediate: true,
      },
    },
    computed: {
        cardName() {
            return this.card.roles
                ? this.card.name || this.card.roles[0].name
                : this.card.name
        },
        cardDescription: {
            get() {
                return this.card.description
            },
            set(value) {
                this.card.description = value
            },
        },
    },
    async mounted() {
        await this.loadPermissions()
    },
    methods: {
        async loadPermissions() {
            try {
                if (this.from === 'groups') {
                    const activePermissions = this.card.layer_permissions.map((layer) => layer)
                    this.grantedPermissions = activePermissions
                    const response = await this.$api.get(`user/group-diff/${this.card.id}/`)
                    this.revokedPermissions =
                        response.data.layer_permissions.map((permission) => permission)
                } else {
                    const activePermissions = this.card.layers.map((layer) => layer)
                    this.grantedPermissions = activePermissions
                    const response = await this.$api.get(
                        `permission/layer-diff/${this.card.id}/`
                    )
                    this.revokedPermissions = response.data
                }
            } catch (e) {
                console.error('Erro ao carregar permissões:', e)
            }
        },
        editCard() {
            this.dialog = true
        },
        toggleSelection() {
            this.isSelected = !this.isSelected
        },
        async saveCard() {
          if (this.from === 'groups') {
            try {
                await this.$api.patch(`/user/group/${this.card.id}/`, {
                    name: this.cardName,
                    description: this.localCardDescription,
                    layer_permissions: this.grantedPermissions.map((layer) => layer.id)
                })
                this.dialog = false
                console.log('Permissões atualizadas com sucesso.')
            } catch (e) {
                console.error('Erro ao salvar permissões:', e)
            } finally {
              this.$store.dispatch('admin/fetchGroupList')
            }
          } else {
            console.log(this.localCardDescription)
            try {
                await this.$api.patch(`/permission/layer/${this.card.id}/`, {
                    description: this.localCardDescription,
                    layer_ids: this.grantedPermissions.map((layer) => layer.id),
                })
                this.dialog = false
                console.log('Permissões atualizadas com sucesso.')
            } catch (e) {
                console.error('Erro ao salvar permissões:', e)
            } finally {
              this.$store.dispatch('admin/fetchGroupList')
            }
          }
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
  min-height: 200px
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
