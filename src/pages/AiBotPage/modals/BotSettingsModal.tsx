import { AppModal } from '@components/AppModal';
import { useI18n } from '@i18n';

import {
  BOT_RISK_LEVELS,
  BOT_SETTINGS_TOGGLES,
  type BotRiskLevelId,
  type BotSettingsToggleId,
} from './aiBotModals.data';
import styles from './modals.module.css';

export type BotSettingsState = {
  toggles: Record<BotSettingsToggleId, boolean>;
  riskLevel: BotRiskLevelId;
  tradeAmount: string;
  duration: string;
};

type BotSettingsModalProps = {
  isOpen: boolean;
  settings: BotSettingsState;
  onClose: () => void;
  onChange: (settings: BotSettingsState) => void;
  onSave: () => void;
};

export function BotSettingsModal({
  isOpen,
  settings,
  onClose,
  onChange,
  onSave,
}: BotSettingsModalProps) {
  const { t } = useI18n();

  function toggleSetting(id: BotSettingsToggleId) {
    onChange({
      ...settings,
      toggles: {
        ...settings.toggles,
        [id]: !settings.toggles[id],
      },
    });
  }

  function setRiskLevel(riskLevel: BotRiskLevelId) {
    onChange({ ...settings, riskLevel });
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      figmaNode="741:15895"
      title={t.aiBot.modals.botSettings.title}
      subtitle={t.aiBot.modals.botSettings.subtitle}
      footer={
        <div className={styles.footerActions}>
          <button type="button" className={styles.footerGhost} onClick={onClose}>
            {t.aiBot.modals.botSettings.cancel}
          </button>
          <button
            type="button"
            className={styles.footerPrimary}
            onClick={() => {
              onSave();
              onClose();
            }}
          >
            {t.aiBot.modals.botSettings.save}
          </button>
        </div>
      }
    >
      <div className={styles.settingsGrid}>
        <section>
          <p className={styles.settingsSectionLabel}>{t.aiBot.modals.botSettings.behaviorTitle}</p>
          <div className={styles.toggleGrid}>
            {BOT_SETTINGS_TOGGLES.map((toggleId) => (
              <div key={toggleId} className={styles.toggleRow}>
                <div className={styles.toggleCopy}>
                  <p className={styles.toggleTitle}>{t.aiBot.modals.botSettings.toggles[toggleId].title}</p>
                  <p className={styles.toggleDescription}>
                    {t.aiBot.modals.botSettings.toggles[toggleId].description}
                  </p>
                </div>
                <button
                  type="button"
                  className={`${styles.toggle}${settings.toggles[toggleId] ? ` ${styles.toggleOn}` : ` ${styles.toggleOff}`}`}
                  role="switch"
                  aria-checked={settings.toggles[toggleId]}
                  onClick={() => toggleSetting(toggleId)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className={styles.settingsSectionLabel}>{t.aiBot.modals.botSettings.tradeConfigTitle}</p>
          <div className={styles.settingsCard}>
            <div className={styles.configRow}>
              <p className={styles.configLabel}>{t.aiBot.parameters.tradeAmount}</p>
              <p className={styles.configValue}>{settings.tradeAmount}</p>
            </div>
            <div className={styles.configRow}>
              <p className={styles.configLabel}>{t.aiBot.parameters.duration}</p>
              <p className={styles.configValue}>{settings.duration}</p>
            </div>
          </div>
        </section>

        <section>
          <p className={styles.settingsSectionLabel}>{t.aiBot.modals.botSettings.riskTitle}</p>
          <div className={styles.settingsCard}>
            <p className={styles.toggleTitle}>{t.aiBot.modals.botSettings.riskLevel}</p>
            <div className={styles.riskChipRow}>
              {BOT_RISK_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`${styles.riskChip}${settings.riskLevel === level ? ` ${styles.riskChipActive}` : ''}`}
                  onClick={() => setRiskLevel(level)}
                >
                  {t.aiBot.modals.riskLevels[level]}
                </button>
              ))}
            </div>
            <p className={styles.settingsHint}>{t.aiBot.modals.botSettings.riskHint}</p>
          </div>
        </section>
      </div>
    </AppModal>
  );
}
