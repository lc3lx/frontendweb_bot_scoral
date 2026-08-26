import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type Ref } from 'react';

import { useI18n } from '@i18n';

import styles from './AppShell.module.css';
import { DashboardHeader } from './DashboardHeader';
import { Sidebar, type DashboardNavId } from './Sidebar';

const MOBILE_SHELL_QUERY = '(max-width: 768px)';

type AppShellProps = {
  title: string;
  activeNav: DashboardNavId;
  children: ReactNode;
  profileDropdownOpen?: boolean;
  scrollContainerRef?: Ref<HTMLDivElement>;
};

type StackMode = 'cards' | 'sidebar';

function resolveStack(target: EventTarget | null): StackMode | null {
  if (!(target instanceof Element)) return null;
  if (target.closest('[data-app-sidebar] a, [data-app-sidebar] button')) return 'sidebar';
  if (target.closest('[data-home-tilt]')) return 'cards';
  return null;
}

function useMobileShell() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_SHELL_QUERY).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_SHELL_QUERY);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}

export function AppShell({
  title,
  activeNav,
  children,
  profileDropdownOpen = false,
  scrollContainerRef,
}: AppShellProps) {
  const { t } = useI18n();
  const shellRef = useRef<HTMLDivElement>(null);
  const sidebarId = useId();
  const isMobile = useMobileShell();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!sidebarOpen || !isMobile) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sidebarOpen, isMobile, closeSidebar]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const setStack = (mode: StackMode | null) => {
      if (mode) shell.dataset.stack = mode;
      else delete shell.dataset.stack;
    };

    const onPointerOver = (event: PointerEvent) => {
      setStack(resolveStack(event.target));
    };

    const onPointerOut = (event: PointerEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && shell.contains(next)) {
        setStack(resolveStack(next));
        return;
      }
      setStack(null);
    };

    shell.addEventListener('pointerover', onPointerOver);
    shell.addEventListener('pointerout', onPointerOut);
    return () => {
      shell.removeEventListener('pointerover', onPointerOver);
      shell.removeEventListener('pointerout', onPointerOut);
    };
  }, []);

  const drawerOpen = isMobile && sidebarOpen;

  return (
    <div ref={shellRef} className={styles.shell} data-drawer={drawerOpen ? 'open' : undefined}>
      <Sidebar
        id={sidebarId}
        activeNav={activeNav}
        open={!isMobile || sidebarOpen}
        onClose={closeSidebar}
      />
      <div className={styles.main} data-app-main="">
        <DashboardHeader
          title={title}
          profileDropdownOpen={profileDropdownOpen}
          menuOpen={drawerOpen}
          menuId={sidebarId}
          onMenuToggle={toggleSidebar}
        />
        {drawerOpen ? (
          <button
            type="button"
            className={styles.scrim}
            aria-label={t.a11y.closeMenu}
            onClick={closeSidebar}
          />
        ) : null}
        <div ref={scrollContainerRef} className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
