import { useEffect, useRef, type ReactNode, type Ref } from 'react';

import styles from './AppShell.module.css';
import { DashboardHeader } from './DashboardHeader';
import { Sidebar, type DashboardNavId } from './Sidebar';

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

export function AppShell({
  title,
  activeNav,
  children,
  profileDropdownOpen = false,
  scrollContainerRef,
}: AppShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={shellRef} className={styles.shell}>
      <Sidebar activeNav={activeNav} />
      <div className={styles.main} data-app-main="">
        <DashboardHeader title={title} profileDropdownOpen={profileDropdownOpen} />
        <div ref={scrollContainerRef} className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
