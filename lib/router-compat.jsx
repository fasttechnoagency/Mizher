// Small adapter so the pages keep their familiar link/navigation calls while the
// app runs on TanStack Router. Search params are plain strings (see router.tsx).
import React, { forwardRef, useMemo, useCallback } from 'react';
import {
  Link as TsLink,
  Outlet as TsOutlet,
  useNavigate as useTsNavigate,
  useParams as useTsParams,
  useLocation as useTsLocation,
  useRouter,
} from '@tanstack/react-router';

function splitTo(to) {
  if (to && typeof to === 'object') {
    const pathname = to.pathname || '';
    return { pathname, search: (to.search || '').replace(/^\?/, ''), hash: (to.hash || '').replace(/^#/, '') };
  }
  const str = String(to ?? '');
  let rest = str;
  let hash = '';
  const h = rest.indexOf('#');
  if (h >= 0) { hash = rest.slice(h + 1); rest = rest.slice(0, h); }
  let search = '';
  const q = rest.indexOf('?');
  if (q >= 0) { search = rest.slice(q + 1); rest = rest.slice(0, q); }
  return { pathname: rest, search, hash };
}

function searchObject(search) {
  if (!search) return undefined;
  return Object.fromEntries(new URLSearchParams(search));
}

function isExternal(path) {
  return /^(https?:|mailto:|tel:)/i.test(path);
}

export const Link = forwardRef(function Link({ to, replace, state, children, ...rest }, ref) {
  const { pathname, search, hash } = splitTo(to);
  if (isExternal(pathname)) {
    return <a ref={ref} href={String(to)} {...rest}>{children}</a>;
  }
  return (
    <TsLink
      ref={ref}
      to={pathname || '.'}
      search={searchObject(search) ?? {}}
      hash={hash || undefined}
      replace={replace}
      state={state}
      {...rest}
    >
      {children}
    </TsLink>
  );
});

export const NavLink = Link;

export function Outlet() {
  return <TsOutlet />;
}

export function useNavigate() {
  const navigate = useTsNavigate();
  const router = useRouter();
  return useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.history.go(to); else router.history.go(to);
      return;
    }
    const { pathname, search, hash } = splitTo(to);
    if (isExternal(pathname)) { window.location.href = String(to); return; }
    navigate({
      to: pathname || '.',
      search: searchObject(search) ?? {},
      hash: hash || undefined,
      replace: !!options.replace,
      state: options.state,
    });
  }, [navigate, router]);
}

export function Navigate({ to, replace = true, state }) {
  const navigate = useNavigate();
  React.useEffect(() => { navigate(to, { replace, state }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export function useParams() {
  return useTsParams({ strict: false });
}

export function useLocation() {
  const loc = useTsLocation();
  return useMemo(() => ({
    pathname: loc.pathname,
    search: loc.searchStr || '',
    hash: loc.hash ? `#${loc.hash}` : '',
    state: loc.state && typeof loc.state === 'object' ? loc.state : null,
    key: loc.state?.__TSR_key || loc.href,
  }), [loc]);
}

export function useNavigationType() {
  const router = useRouter();
  return router.history.action === 'POP' || router.history.action === 'BACK' || router.history.action === 'FORWARD' || router.history.action === 'GO' ? 'POP' : 'PUSH';
}

export function useSearchParams() {
  const loc = useTsLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(loc.searchStr || ''), [loc.searchStr]);
  const setParams = useCallback((next, opts = {}) => {
    const value = typeof next === 'function' ? next(new URLSearchParams(loc.searchStr || '')) : next;
    const qs = new URLSearchParams(value).toString();
    navigate(`${loc.pathname}${qs ? `?${qs}` : ''}`, opts);
  }, [loc.pathname, loc.searchStr, navigate]);
  return [params, setParams];
}
