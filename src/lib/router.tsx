import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface RouteMatch {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

interface RouterContextType {
  route: RouteMatch;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

const routes: { path: string; regex: RegExp; keys: string[] }[] = [];

function addRoute(path: string) {
  const keys: string[] = [];
  const pattern = path.replace(/:([^/]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });
  routes.push({ path, regex: new RegExp(`^${pattern}$`), keys });
}

[
  '/', '/shop', '/men', '/women', '/shoes', '/clothing',
  '/product/:slug', '/cart', '/checkout', '/wishlist',
  '/account', '/orders', '/order/:id', '/about', '/contact',
  '/faq', '/auth', '/admin',
].forEach(addRoute);

function matchRoute(pathname: string): RouteMatch {
  for (const r of routes) {
    const match = r.regex.exec(pathname);
    if (match) {
      const params: Record<string, string> = {};
      r.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
      return { path: r.path, params, query: new URLSearchParams(window.location.search) };
    }
  }
  return { path: '/', params: {}, query: new URLSearchParams(window.location.search) };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteMatch>(() => matchRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(matchRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to);
    setRoute(matchRoute(to));
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function navigate(to: string) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

export function Link({ to, children, className, onClick, ...rest }: { to: string; children: ReactNode; className?: string; onClick?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
