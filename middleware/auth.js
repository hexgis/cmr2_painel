export default function ({ store, redirect, route, getRouteBaseName, localePath }) {
    if (route.path.startsWith('/pt-br/')) {
      const newPath = route.path.replace('/pt-br', '')
      return redirect(newPath)
    }
    store.dispatch('auth/tryAutoLogin')
    const baseName = getRouteBaseName()
    const isPublicRoute = [
      'cadastro',
      'portal',
      'projeto',
      'terras-indigenas',
      'como-funciona',
      'video',
      'contato'].includes(baseName)
    if (!store.state.auth.token) {
      if (getRouteBaseName() === 'auth-confirmar') {
        const code = route.query.code;
        if (code) {
          store.commit('auth/setConfirmationCode', code);
        }
        return;
      }
      if (isPublicRoute) return
      if (baseName !== 'login') {
          return redirect(localePath('/login'))
      }
  } else if (baseName === 'login') {
      return redirect(localePath('/'))
  }
}
