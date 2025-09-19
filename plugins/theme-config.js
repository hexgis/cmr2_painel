/**
 * Theme Configuration Plugin
 *
 * This plugin manages user theme preferences by fetching dark mode settings
 *
 * Features:
 * - Fetches user theme preferences from /user/logged/ endpoint
 * - Applies dark/light theme based on user settings
 * - Watches authentication token changes to update theme
 */
export default ({ $axios, store, $vuetify, app }) => {
  if (process.server) return;

  const applyUserTheme = async () => {
    try {
      const token = store.state.auth.token;
      if (!token) return false;

      $axios.setToken(token, 'Bearer');
      const { settings } = await $axios.$get('/user/logged/');
      const isDarkMode = settings?.dark_mode_active ?? false;

      $vuetify.theme.dark = isDarkMode;

      return true;
    } catch (error) {
      return false;
    }
  };

  applyUserTheme();

  store.watch(
    (state) => state.auth.token,
    (newToken) => {
      if (newToken) {
        setTimeout(() => {
          applyUserTheme();
        }, 100);
      } else {
        $vuetify.theme.dark = false;
      }
    }
  );
};
