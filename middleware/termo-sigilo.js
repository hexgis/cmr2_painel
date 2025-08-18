/**
 * Middleware para verificar se o usuário aceitou o termo de sigilo
 */
export default async function ({
  $axios, redirect, route, store,
}) {
  // Verificar se o usuário está autenticado
  if (!store.state.auth.loggedIn) {
    return;
  }

  // Rotas que não precisam de verificação do termo
  const exemptRoutes = [
    '/termo-sigilo',
    '/login',
    '/logout',
    '/login',
  ];

  // Se a rota atual está isenta, não verificar
  if (exemptRoutes.some((route) => route.path === route.path)) {
    return;
  }

  try {
    // Verificar se o usuário já aceitou o termo de sigilo
    const response = await $axios.get('/user/termo-sigilo/status/');

    if (!response.data.has_accepted) {
      // Se não aceitou, redirecionar para a página do termo
      return redirect('/termo-sigilo');
    }
  } catch (error) {
    console.error('Erro ao verificar status do termo de sigilo:', error);
    // Em caso de erro, redirecionar para o termo por segurança
    return redirect('/termo-sigilo');
  }
}
