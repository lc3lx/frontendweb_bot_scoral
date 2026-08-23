import type { ReactNode, Ref } from 'react';



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



export function AppShell({

  title,

  activeNav,

  children,

  profileDropdownOpen = false,

  scrollContainerRef,

}: AppShellProps) {

  return (

    <div className={styles.shell}>

      <Sidebar activeNav={activeNav} />

      <div className={styles.main}>

        <DashboardHeader title={title} profileDropdownOpen={profileDropdownOpen} />

        <div ref={scrollContainerRef} className={styles.content}>

          {children}

        </div>

      </div>

    </div>

  );

}


