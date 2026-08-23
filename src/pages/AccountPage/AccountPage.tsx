import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';
import { ROUTES } from '@router/routes';

import { AccountContent } from './AccountContent';
import { ChangePasswordContent } from './ChangePasswordContent';
import { EditProfileContent } from './EditProfileContent';
import { NotificationsContent } from './NotificationsContent';

function resolveShellTitle(pathname: string, titles: { main: string; sub: string }) {
  if (pathname === ROUTES.account) {
    return titles.main;
  }

  return titles.sub;
}

function resolveSeo(pathname: string, seo: {
  main: { title: string; description: string };
  editProfile: { title: string; description: string };
  changePassword: { title: string; description: string };
  notifications: { title: string; description: string };
}) {
  if (pathname.endsWith('/edit-profile')) {
    return seo.editProfile;
  }

  if (pathname.endsWith('/change-password')) {
    return seo.changePassword;
  }

  if (pathname.endsWith('/notifications')) {
    return seo.notifications;
  }

  return seo.main;
}

/** Figma frames "11" (737:950), "23" (741:18243), "24" (741:18453), "25" (744:18579). */
export function AccountPage() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  const shellTitle = resolveShellTitle(pathname, {
    main: t.account.header.title,
    sub: t.account.header.subPageTitle,
  });

  const seo = resolveSeo(pathname, {
    main: t.account.seo,
    editProfile: t.account.subPages.editProfile.seo,
    changePassword: t.account.subPages.changePassword.seo,
    notifications: t.account.subPages.notifications.seo,
  });

  useEffect(() => {
    document.title = seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', seo.description);
  }, [seo.description, seo.title]);

  return (
    <AppShell title={shellTitle} activeNav="account">
      <Routes>
        <Route index element={<AccountContent figmaNode="737:950" />} />
        <Route path="edit-profile" element={<EditProfileContent figmaNode="741:18243" />} />
        <Route path="change-password" element={<ChangePasswordContent figmaNode="741:18453" />} />
        <Route path="notifications" element={<NotificationsContent figmaNode="744:18579" />} />
      </Routes>
    </AppShell>
  );
}
