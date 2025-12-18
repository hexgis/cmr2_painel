import Vue from 'vue'
import ConfirmDialog from '~/components/base/ConfirmDialog.vue'

export default (context, inject) => {
    const ConfirmConstructor = Vue.extend(ConfirmDialog)

    const options = {}
    if (context.app && context.app.vuetify) {
        options.vuetify = context.app.vuetify
        options.i18n = context.app.i18n
    }

    const instance = new ConfirmConstructor(options)
    instance.$mount()

    if (process.client) document.body.appendChild(instance.$el)

    inject('confirm', (options) => instance.open(options))
}
