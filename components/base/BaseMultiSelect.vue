<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    max-height="300px"
    max-width="340px"
    nudge-bottom="40"
    z-index="10"
    eager
    disable-keys
  >
    <template #activator="{ on }">
      <v-text-field
        v-model="current"
        outlined
        clearable
        dense
        v-on="on"
        @click:clear="current = null, $emit('input', null)"
        @input="filterItems($event)"
      >
        <template #append>
          <v-icon
            class="base__multi-select-icon"
            @click="menu = true"
          >
            {{ menu ? 'mdi-menu-up' : 'mdi-menu-down' }}
          </v-icon>
        </template>
      </v-text-field>
    </template>
    <v-list
      dense
      class="pa-0"
      eager
    >
      <v-list-group
        v-for="(item, i) in itemsFiltered"
        :key="i"
        no-action
        sub-group
        dense
        eager
        ripple
      >
        <template #activator>
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item
          v-for="(layer, j) in item.layers"
          :key="j"
          link
          ripple
          @click="handleSelect(layer)"
        >
          <v-list-item-title v-text="layer.name" />
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: 'BaseMultiSelect',

  props: {
    items: {
      type: Array,
      required: true,
    },
  },

  data: () => ({
    menu: false,
    current: null,
    itemsFiltered: [],
  }),

  mounted() {
    this.itemsFiltered = this.items;
  },

  methods: {
    filterItems(value) {
      if (value) {
        this.itemsFiltered = this.items.filter((item) => {
          const layers = item.layers.filter((layer) => {
            const name = layer.name.toLowerCase();
            const search = value.toLowerCase();
            return name.includes(search);
          });
          return layers.length ? layers : false;
        });
      } else {
        this.itemsFiltered = this.items;
      }
    },

    handleSelect(layer) {
      this.current = layer.name;
      this.menu = false;
      this.$emit('input', `${layer.name}_${layer.id}`);
    },
  },

};
</script>

<style scoped>
.base__multi-select-icon {
  cursor: pointer;
}
</style>
