import { useEffect, useState } from 'react';

import { AppModal } from '@components/AppModal';
import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';

import { aiBotService } from '../data/aiBotService';
import type { StrategyGridId, StrategyGridOption, StrategyPresentationKey } from './aiBotModals.data';
import { RiskBadge } from './RiskBadge';
import styles from './modals.module.css';

type StrategyGridModalProps = {
  isOpen: boolean;
  selectedId: StrategyGridId;
  strategies: StrategyGridOption[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (id: StrategyGridId) => void;
};

function strategyCopy(
  t: ReturnType<typeof useI18n>['t'],
  key: StrategyPresentationKey,
  kind: 'desc' | 'bestFor',
): string {
  const grid = t.aiBot.modals.strategyGrid;
  if (kind === 'desc') {
    const map: Record<StrategyPresentationKey, string> = {
      rsi: grid.rsiDesc,
      bollinger: grid.bollingerDesc,
      macd: grid.macdDesc,
      stochastic: grid.stochasticDesc,
      smart: grid.smartDesc,
      ema: grid.emaDesc,
      alt5: grid.alt5Desc,
      ai: grid.aiDesc,
    };
    return map[key];
  }
  const map: Record<StrategyPresentationKey, string> = {
    rsi: grid.rsiBestFor,
    bollinger: grid.bollingerBestFor,
    macd: grid.macdBestFor,
    stochastic: grid.stochasticBestFor,
    smart: grid.smartBestFor,
    ema: grid.emaBestFor,
    alt5: grid.alt5BestFor,
    ai: grid.aiBestFor,
  };
  return map[key];
}

export function StrategyGridModal({
  isOpen,
  selectedId,
  strategies,
  loading = false,
  onClose,
  onSelect,
}: StrategyGridModalProps) {
  const { t } = useI18n();
  const [localStrategies, setLocalStrategies] = useState<StrategyGridOption[]>(strategies);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setLocalStrategies(strategies);
  }, [strategies]);

  useEffect(() => {
    if (!isOpen || strategies.length > 0) return;
    let active = true;
    setLocalLoading(true);
    void aiBotService
      .listStrategies()
      .then((items) => {
        if (active) setLocalStrategies(items);
      })
      .finally(() => {
        if (active) setLocalLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, strategies.length]);

  const items = localStrategies;
  const busy = loading || localLoading;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="compact"
      figmaNode="737:6713"
      title={
        <>
          {t.aiBot.modals.strategyGrid.titlePrefix}
          <span className={styles.titleRegular}>{t.aiBot.modals.strategyGrid.titleEmphasis}</span>
        </>
      }
      subtitle={t.aiBot.modals.strategyGrid.subtitle}
    >
      {busy ? <p className={styles.strategyEmpty}>{t.aiBot.modals.strategyGrid.loading}</p> : null}

      {!busy && items.length === 0 ? (
        <p className={styles.strategyEmpty}>{t.aiBot.modals.strategyGrid.empty}</p>
      ) : null}

      {!busy && items.length > 0 ? (
        <div className={styles.strategyGrid}>
          {items.map((option) => {
            const selected = option.id === selectedId;
            const comingSoon = !option.enabled;
            return (
              <button
                key={option.id}
                type="button"
                className={`${styles.strategyCard}${selected ? ` ${styles.strategyCardSelected}` : ''}${
                  comingSoon ? ` ${styles.strategyCardDisabled}` : ''
                }`}
                disabled={comingSoon}
                onClick={() => {
                  if (comingSoon) return;
                  onSelect(option.id);
                  onClose();
                }}
              >
                <img
                  className={styles.strategyPreview}
                  src={option.preview}
                  alt=""
                  aria-hidden="true"
                />
                <div className={styles.strategyCardHead}>
                  <p className={styles.strategyCardTitle}>{option.name}</p>
                  <div className={styles.strategyCardBadges}>
                    {comingSoon ? (
                      <span className={styles.comingSoonBadge}>
                        {t.aiBot.modals.strategyGrid.comingSoon}
                      </span>
                    ) : (
                      <RiskBadge risk={option.risk} label={t.aiBot.modals.riskLevels[option.risk]} />
                    )}
                    {selected && !comingSoon ? (
                      <img
                        className={styles.checkIcon}
                        src={aiBotAssets.iconCheck}
                        alt=""
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                </div>
                <p className={styles.strategyCardDescription}>
                  {strategyCopy(t, option.descriptionKey, 'desc')}
                </p>
                <p className={styles.strategyCardBestFor}>
                  {comingSoon
                    ? t.aiBot.modals.strategyGrid.comingSoon
                    : strategyCopy(t, option.bestForKey, 'bestFor')}
                </p>
              </button>
            );
          })}
        </div>
      ) : null}
    </AppModal>
  );
}
