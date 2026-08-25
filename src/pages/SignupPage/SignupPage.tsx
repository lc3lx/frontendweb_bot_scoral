import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@router/routes';

/** Scar Alpha signup is Binolla-only — same page as login with register mode. */
export function SignupPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const target = query ? `${ROUTES.login}?${query}` : `${ROUTES.login}?mode=register`;

  useEffect(() => {
    document.title = 'Sign up';
  }, []);

  return <Navigate to={target} replace />;
}
