/**
   * Middleware to verify if the user has accepted the confidentiality agreement
   *
   * Features:
   * - Checks if the user is authenticated before proceeding
   * - Defines routes exempt from agreement verification (/confidentiality-agreement, /login, /logout)
   * - Queries the acceptance status of the agreement via API (/user/confidentiality-agreement/status/)
   * - Redirects to /confidentiality-agreement if the user has not accepted
   * - In case of an error during verification, redirects to the agreement for safety
 */
export default async function privacyAgreementMiddleware({
  $axios, redirect, route, store,
}) {
  if (!store.state.auth.loggedIn) {
    return;
  }

  const exemptRoutes = [
    '/privacy-agreement',
    '/login',
    '/logout',
  ];

  if (exemptRoutes.some((exemptRoute) => exemptRoute === route.path)) {
    return;
  }

  try {
    const response = await $axios.get('/user/privacy-agreement/status/');

    if (!response.data.has_accepted) {
      redirect('/privacy-agreement');
    }
  } catch (error) {
    console.error('Erro ao verificar status do termo de sigilo:', error);
    redirect('/privacy-agreement');
  }
}
