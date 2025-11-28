<template>
  <div class="_modal-wrapper" v-if="value">
    <div class="_modal-backdrop"></div>
    <div class="_modal-container container">
      <div class="_modal">
        <div class="_modal-header d-flex justify-space-between align-start">
          <button @click="close()" class="close-button px-4 py-2">
            <v-icon>mdi-window-close</v-icon>
          </button>
          <slot name="header-action-button">
            <button @click="report()" class="report-button px-5 py-2">
              <v-icon>mdi-printer</v-icon>
            </button>
          </slot>
        </div>
        <main class="_modal-body">
          <slot></slot>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    // Modal visibility
    value: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    close() {
      // Change the "value" prop here and in the parent component, via v-model
      this.$emit('input', false);
      this.$emit('close');
    },
    report() {
      window.print();
      this.$emit('report');
    }
  }
}
</script>

<style scoped>
._modal-wrapper {
  position: absolute;
  z-index: 6;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
}

._modal-backdrop {
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 1;
  background-color: rgba(0,0,0,0.5);
}

._modal-container {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
}

._modal {
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  position: relative;
}

._modal-header {
  background-color: rgb(245, 245, 245);
  border-radius: 10px 10px 0 0;
}

._modal-header button {
  max-height: 40px;
}

._modal-body {
  height: calc(100% - 40px);
  overflow-y: auto;
}

.close-button {
  font-size: 16px;
  border-radius: 10px 0 10px 0;
  background-color: whitesmoke;
}

.close-button i {
  font-size: 22px;
}

.report-button {
  border-radius: 0 8px 0 0;
  background-color: #2c3649;
}

.report-button i {
  color: white;
}

@media print {
  ._modal-wrapper {
    position: relative;
    height: auto;
    display: block;
  }

  ._modal-body {
    display: block;
    height: auto;
    overflow-y: visible;
  }

  ._modal-container {
    max-width: none !important;
    padding: 0;
  }

  ._modal {
    border-radius: 0px;
  }

  ._modal-header {
    display: none !important;
  }
}
</style>
