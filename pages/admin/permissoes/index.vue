<template>
    <div class="permissions">
        <h1 class="text-uppercase pb-4">Gerenciar Permissões</h1>
        <FullCard v-for="label in props" :key="label.url" :props="label" />
    </div>
</template>

<script>
import FullCard from '/components/admin/FullCard.vue'
export default {
    components: { FullCard },
    name: 'GerenciarPermissoes',
    layout: 'admin',
    data() {
        return {
            props: [
                {
                    url: 'grupos',
                    icon: 'mdi-group',
                    optionLabel: 'Grupos',
                },
                {
                    url: 'instituicoes',
                    icon: 'mdi-office-building',
                    optionLabel: 'Instituições',
                },
                {
                    url: 'fpe',
                    icon: 'mdi-tree',
                    optionLabel: 'FPE - Frente de Proteção Etnoambiental',
                },
            ],
        }
    },
}
</script>

<style lang="sass" scoped>
.permissions
  width: 100%
  max-width: 800px
  padding: 1rem 1.5rem
</style>
