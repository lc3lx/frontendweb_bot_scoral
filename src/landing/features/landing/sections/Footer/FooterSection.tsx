import { SectionContainer } from '@landing/components/organisms/SectionContainer';
import { FIGMA_LANDING_NODES } from '@landing/constants/figma';
import { useI18n } from '@landing/i18n';
import {
  FOOTER_COMPANY_HREF,
  FOOTER_LOGO,
  FOOTER_NAV_GROUPS,
  FOOTER_PRIVACY_HREF,
} from '../../data/footer';
import { LANDING_SECTION_IDS } from '../../constants/sectionIds';
import styles from './FooterSection.module.css';

/**
 * Footer — Figma 385:1415 (logo, nav groups, disclaimer, copyright, glow)
 */
export function FooterSection() {
  const { t } = useI18n();

  return (
    <SectionContainer
      as="footer"
      id={LANDING_SECTION_IDS.footer}
      spacing="none"
      width="full"
      background="transparent"
      contained={false}
      className={styles.footer}
      data-figma-node={FIGMA_LANDING_NODES.footer}
    >
      <div className={styles.glow} aria-hidden="true" data-figma-node="385:1470" />
      <div className={styles.topBorder} aria-hidden="true" data-figma-node="385:1469" />

      <div className={`${styles.inner} motionFadeIn`}>
        <div className={styles.band}>
          <div className={styles.top}>
            <div className={styles.brand} data-figma-node="385:1433">
              <a
                className={styles.logoLink}
                href={`#${LANDING_SECTION_IDS.hero}`}
                aria-label={t.footer.logoAlt}
              >
                <img
                  className={styles.logo}
                  src={FOOTER_LOGO.src}
                  alt=""
                  width={FOOTER_LOGO.width}
                  height={FOOTER_LOGO.height}
                  decoding="async"
                  data-figma-node={FOOTER_LOGO.figmaNodeId}
                />
              </a>
              <p className={styles.disclaimer}>
                {t.footer.disclaimerBefore}
                <a className={styles.disclaimerLink} href={FOOTER_PRIVACY_HREF}>
                  {t.footer.disclaimerLinkLabel}
                </a>
                {t.footer.disclaimerAfter}
              </p>
            </div>

            <nav className={styles.menus} aria-label={t.a11y.footerNav} data-figma-node="385:1448">
              {FOOTER_NAV_GROUPS.map((group) => {
                const titleId = `footer-${group.id}-heading`;
                const dense = group.id === 'general';
                const groupCopy = t.footer.groups[group.id as keyof typeof t.footer.groups];
                return (
                  <div
                    key={group.id}
                    className={styles.group}
                    data-figma-node={group.figmaNodeId}
                  >
                    <p className={styles.groupTitle} id={titleId}>
                      {groupCopy.title}
                    </p>
                    <ul
                      className={`${styles.linkList} ${dense ? styles.linkListDense : ''}`}
                      aria-labelledby={titleId}
                    >
                      {group.links.map((link) => (
                        <li key={link.id}>
                          <a
                            className={styles.link}
                            href={link.href}
                            {...(link.external
                              ? {
                                  target: '_blank',
                                  rel: 'noopener noreferrer',
                                }
                              : {})}
                          >
                            {groupCopy.links[link.id] ?? link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className={styles.dividerWrap} data-figma-node="385:1429">
            <hr className={styles.divider} data-figma-node="385:1431" />
          </div>

          <p className={styles.copyright} data-figma-node="55:514">
            {t.footer.copyrightBefore}
            {t.footer.copyrightCompany ? (
              <a
                className={styles.companyLink}
                href={FOOTER_COMPANY_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.footer.copyrightCompany}
              </a>
            ) : null}
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}
