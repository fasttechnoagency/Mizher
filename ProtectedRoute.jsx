import { Outlet, Navigate, useLocation } from '@/lib/router-compat';
import { useAuth } from '@/lib/AuthContext';

/**
 * @param {{ children?: import('react').ReactNode, unauthenticatedElement?: import('react').ReactNode }} [props]
 */
export default function ProtectedRoute({ children = undefined, unauthenticatedElement = undefined } = {}) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return null;

  if (!isAuthenticated) {
    if (unauthenticatedElement) return unauthenticatedElement;
    const back = location.pathname + (location.search || '');
    return <Navigate to={back && back !== '/' ? `/login?returnTo=${encodeURIComponent(back)}` : '/login'} replace />;
  }

  return children ?? <Outlet />;
}
