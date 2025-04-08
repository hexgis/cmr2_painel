export default async ({ $axios, store, $vuetify }) => {
  if (process.server) return;

  try {
    const token = store.state.auth.token;
    if (!token) throw new Error('No auth token found');

    $axios.setToken(token, 'Bearer');
    const { settings } = await $axios.$get('/user/logged/');
    const isDarkMode = settings.dark_mode_active;
    store.commit('setTheme', isDarkMode);
    $vuetify.theme.dark = isDarkMode;
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
  }
};
