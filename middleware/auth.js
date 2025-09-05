// eslint-disable-next-line func-names, consistent-return
export default function ({
  store, redirect, route, getRouteBaseName, localePath,
}) {
  if (route.path.startsWith('/pt-br/')) {
    const newPath = route.path.replace('/pt-br', '');
    return redirect(newPath);
  }

  store.dispatch('auth/tryAutoLogin');

  const baseName = getRouteBaseName();
  const isPublicRoute = [
    'cadastro',
    'index',
    'cmr',
    'cmr-support',
    'projeto',
    'terras-indigenas',
    'como-funciona',
    'video',
    'contato',
  ].includes(baseName);

  if (!store.state.auth.token) {
    if (baseName === 'auth-confirmar') {
      const { code } = route.query;
      if (code) store.commit('auth/setConfirmationCode', code);
      return;
    }

    if (isPublicRoute) return;

    if (baseName !== 'login') {
      // ✅ usando template string (evita "Unexpected string concatenation")
      const redirectPath = `${localePath('/login')}?redirect=${encodeURIComponent(route.fullPath)}`;
      return redirect(redirectPath);
    }
  } else if (baseName === 'login') {
    const redirectTo = route.query.redirect || localePath('/cmr');
    return redirect(redirectTo);
  }
}
