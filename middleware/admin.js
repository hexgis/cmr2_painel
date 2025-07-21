export default function admin({
  store, redirect, route, localePath,
}) {
  // Ensure user data is loaded
  if (!store.state.userProfile.user) {
    return redirect(localePath('/login'));
  }

  const { user } = store.state.userProfile;
  const routePath = route.path;

  // Check if user has admin access
  const hasAdminAccess = user.components && (
    user.components.feedback_admin === true
    || user.components.feedback_dev === true
  );

  // Check if user is Gestor
  const isGestor = user.roles && user.roles.some((role) => role.name === 'Gestor');

  // Allow access to /admin/area-restrita for any authenticated user
  if (routePath === '/admin/area-restrita' || routePath.startsWith('/admin/area-restrita/')) {
    return null; // Allow access to restricted area for all authenticated users
  }

  if (routePath === '/admin/criticas' || routePath.startsWith('/admin/criticas/')) {
    return null;
  }

  // Allow access if user has admin access OR is Gestor
  if (hasAdminAccess || isGestor) {
    // If user is only Gestor (not admin), restrict to specific routes
    if (isGestor && !hasAdminAccess) {
      const allowedRoutes = [
        '/admin',
        '/admin/criticas',
      ];

      const isAllowed = allowedRoutes.some((allowedRoute) => routePath === allowedRoute || routePath.startsWith(`${allowedRoute}/`));

      if (!isAllowed) {
        return redirect(localePath('/admin/area-restrita'));
      }
    }
    return null; // Allow access
  }

  // No access - redirect to main CMR page
  return redirect(localePath('/cmr'));
}
