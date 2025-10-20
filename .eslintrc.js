module.exports = {
  // Defines the directory of this file as the root of the project
  root: true,
  /**
     * Environments which the project is designed to run, providing all predefined global variables.
     * @example process.env.NODE_ENV
     */
  env: {
    browser: true,
    node: true,
  },
  settings: {
    /**
         * An array of additional modules to consider as "core" modules
         * @see https://github.com/import-js/eslint-plugin-import/blob/main/README.md#importcore-modules
         */
    /**
         * Modules already included in Nuxt.js
         * BUGFIX: without this setting, rule import/no-extraneous-dependencies is violated.
         * @see https://stackoverflow.com/a/55174675
         */
    'import/core-modules': ['vue', 'vuex'],
  },
  // Configurations (set of rules)
  extends: [
    /**
         * Airbnb JavaScript Style Guide
         * @see https://github.com/airbnb/javascript
         */
    'airbnb-base',
    /**
         * Vue Style Guide
         * @see https://vuejs.org/style-guide/
         * @see https://eslint.vuejs.org
         */
    'plugin:vue/recommended',
    /**
         * Nuxt specific rules
         * @see https://github.com/nuxt/eslint-plugin-nuxt#bulb-rules
         */
    'plugin:nuxt/recommended',
  ],
  // Extends or overrides a set of rules
  rules: {
    /**
         * Keeps the rule that disallow the use of the console, but only in
         * a production environment,
         * so that you can still use it in the development phase.
         * @see https://eslint.org/docs/rules/no-console
         */
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    /**
         * Keeps the rule that disallow the use of the debugger, but only in
         * a production environment,
         * so that you can still use it in the development phase.
         * @see https://eslint.org/docs/rules/no-debugger
         */
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
};
