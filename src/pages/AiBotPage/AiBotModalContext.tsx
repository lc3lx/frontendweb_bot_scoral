import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useI18n } from '@i18n';

import {
  BRANDED_STRATEGY_OPTIONS,
  MARKET_TYPE_OPTIONS,
  getDefaultBrandedStrategyId,
  getDefaultMarketTypeId,
  pairMatchesMarketType,
  getDefaultStrategyGridId,
  getDefaultTradingPairIds,
  type BotRiskLevelId,
  type BotSettingsToggleId,
  type BrandedStrategyId,
  type MarketTypeId,
  type StrategyGridId,
  type StrategyGridOption,
} from './modals/aiBotModals.data';
import { formatSelectedPairsLabel } from '@shared/market/pairDisplay';
import type { BotRuntimeResponse } from '@shared/api/types';
import { aiBotService } from './data/aiBotService';
import type { BotSettingsState } from './modals/BotSettingsModal';

export type AiBotModalId =
  | 'marketType'
  | 'strategyGrid'
  | 'tradingPair'
  | 'technicalIndicator'
  | 'strategyDetail'
  | 'botSettings';

export type AiBotConfiguration = {
  marketTypeId: MarketTypeId;
  tradingPairIds: string[];
  strategyGridId: StrategyGridId;
  brandedStrategyId: BrandedStrategyId;
  marketType: string;
  tradingPair: string;
  strategy: string;
  indicator: string;
};

type AiBotModalContextValue = {
  activeModal: AiBotModalId | null;
  detailStrategyId: BrandedStrategyId | null;
  configuration: AiBotConfiguration;
  botSettings: BotSettingsState;
  strategies: StrategyGridOption[];
  strategiesLoading: boolean;
  openModal: (modal: AiBotModalId) => void;
  closeModal: () => void;
  openStrategyDetail: (strategyId: BrandedStrategyId) => void;
  closeStrategyDetail: () => void;
  setMarketType: (id: MarketTypeId) => void;
  setTradingPairIds: (ids: string[]) => void;
  toggleTradingPair: (id: string) => void;
  setStrategyGrid: (id: StrategyGridId) => void;
  setBrandedStrategy: (id: BrandedStrategyId) => void;
  selectBrandedStrategy: (id: BrandedStrategyId) => void;
  setBotSettings: (settings: BotSettingsState) => void;
  syncBotSettingsFromPage: (
    tradeAmount: string,
    duration: string,
    profitTarget: string,
    lossLimit: string,
  ) => void;
  syncFromBotRuntime: (bot: BotRuntimeResponse) => void;
  persistBotSettings: () => Promise<void>;
};

const AiBotModalContext = createContext<AiBotModalContextValue | null>(null);

function parseRiskLevel(value: string | null | undefined): BotSettingsState['riskLevel'] {
  if (value === 'risk-low') return 'low';
  if (value === 'risk-high') return 'high';
  return 'medium';
}

function buildDefaultBotSettings(): BotSettingsState {
  return {
    toggles: {
      'auto-profit': true,
      'auto-loss': true,
      'signal-confirm': false,
      notifications: true,
    },
    riskLevel: 'medium',
    tradeAmount: '$25',
    duration: '1m',
    profitTarget: '50',
    lossLimit: '30',
  };
}

type AiBotModalProviderProps = {
  children: ReactNode;
};

export function AiBotModalProvider({ children }: AiBotModalProviderProps) {
  const { t } = useI18n();
  const [activeModal, setActiveModal] = useState<AiBotModalId | null>(null);
  const [detailStrategyId, setDetailStrategyId] = useState<BrandedStrategyId | null>(null);
  const [marketTypeId, setMarketTypeId] = useState<MarketTypeId>(getDefaultMarketTypeId());
  const [tradingPairIds, setTradingPairIdsState] = useState<string[]>(getDefaultTradingPairIds());
  const [strategyGridId, setStrategyGridId] = useState<StrategyGridId>(getDefaultStrategyGridId());
  const [brandedStrategyId, setBrandedStrategyId] = useState<BrandedStrategyId>(
    getDefaultBrandedStrategyId(),
  );
  const [botSettings, setBotSettingsState] = useState<BotSettingsState>(buildDefaultBotSettings());
  const [strategies, setStrategies] = useState<StrategyGridOption[]>([]);
  const [strategiesLoading, setStrategiesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setStrategiesLoading(true);
    void aiBotService
      .listStrategies()
      .then((items) => {
        if (!active) return;
        setStrategies(items);
        setStrategyGridId((current) => {
          if (items.some((item) => item.id === current && item.enabled)) return current;
          const firstEnabled = items.find((item) => item.enabled);
          return firstEnabled?.id ?? getDefaultStrategyGridId();
        });
      })
      .finally(() => {
        if (active) setStrategiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const configuration = useMemo<AiBotConfiguration>(() => {
    const marketOption = MARKET_TYPE_OPTIONS.find((item) => item.id === marketTypeId);
    const strategyOption = strategies.find((item) => item.id === strategyGridId);
    const brandedOption = BRANDED_STRATEGY_OPTIONS.find((item) => item.id === brandedStrategyId);
    return {
      marketTypeId,
      tradingPairIds,
      strategyGridId,
      brandedStrategyId,
      marketType: marketOption ? t.aiBot.modals.marketType[marketOption.titleKey] : marketTypeId,
      tradingPair: formatSelectedPairsLabel(tradingPairIds),
      strategy: strategyOption?.name ?? strategyGridId,
      indicator: brandedOption
        ? t.aiBot.modals.brandedStrategy[brandedOption.titleKey]
        : brandedStrategyId,
    };
  }, [brandedStrategyId, marketTypeId, strategies, strategyGridId, t.aiBot.modals, tradingPairIds]);

  const openModal = useCallback((modal: AiBotModalId) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setDetailStrategyId(null);
  }, []);

  const openStrategyDetail = useCallback((strategyId: BrandedStrategyId) => {
    setDetailStrategyId(strategyId);
    setActiveModal('strategyDetail');
  }, []);

  const closeStrategyDetail = useCallback(() => {
    setDetailStrategyId(null);
    setActiveModal('technicalIndicator');
  }, []);

  const setMarketType = useCallback((id: MarketTypeId) => {
    setMarketTypeId(id);

    // Drop pairs the new scope no longer offers. Leaving them selected would have the
    // bot trading OTC books while the page says "Global" — the label and the behaviour
    // have to agree. Widening to both markets keeps everything already chosen.
    setTradingPairIdsState((current) => {
      const kept = current.filter((symbol) => pairMatchesMarketType(symbol, id));
      if (kept.length > 0) return kept;
      // Nothing survived: fall back to the defaults that fit the new scope.
      const fallback = getDefaultTradingPairIds().filter((symbol) =>
        pairMatchesMarketType(symbol, id),
      );
      return fallback.length > 0 ? fallback : [];
    });
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
      body: JSON.stringify({
        sessionId: '281dcf',
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'AiBotModalContext.tsx:setMarketType',
        message: 'market_type_local_only',
        data: { marketTypeId: id, willCallApply: false },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  const setTradingPairIds = useCallback((ids: string[]) => {
    setTradingPairIdsState(ids);
  }, []);

  const toggleTradingPair = useCallback((id: string) => {
    setTradingPairIdsState((current) => {
      if (current.includes(id)) {
        const next = current.filter((item) => item !== id);
        return next.length > 0 ? next : current;
      }
      return [...current, id];
    });
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
      body: JSON.stringify({
        sessionId: '281dcf',
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'AiBotModalContext.tsx:toggleTradingPair',
        message: 'pair_toggle_local_only',
        data: { pairId: id, willCallApply: false },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  const setStrategyGrid = useCallback((id: StrategyGridId) => {
    setStrategyGridId(id);
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
      body: JSON.stringify({
        sessionId: '281dcf',
        runId: 'pre-fix',
        hypothesisId: 'A',
        location: 'AiBotModalContext.tsx:setStrategyGrid',
        message: 'strategy_grid_local_only',
        data: { strategyGridId: id, willCallApply: false },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  const setBrandedStrategy = useCallback((id: BrandedStrategyId) => {
    setBrandedStrategyId(id);
  }, []);

  const selectBrandedStrategy = useCallback(
    (id: BrandedStrategyId) => {
      setBrandedStrategyId(id);
      setActiveModal(null);
      setDetailStrategyId(null);
      // #region agent log
      fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
        body: JSON.stringify({
          sessionId: '281dcf',
          runId: 'pre-fix',
          hypothesisId: 'C',
          location: 'AiBotModalContext.tsx:selectBrandedStrategy',
          message: 'branded_strategy_apply_start',
          data: {
            brandedStrategyId: id,
            strategyGridId,
            pairCount: tradingPairIds.length,
            willCallApply: true,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      void aiBotService
        .applyControl('apply', {
          pairs: tradingPairIds.length ? tradingPairIds : undefined,
          amount: aiBotService.parseAmount(botSettings.tradeAmount),
          durationSeconds: 60,
          profitTarget: aiBotService.parseTargetAbs(botSettings.profitTarget, 50),
          lossLimit: aiBotService.parseTargetAbs(botSettings.lossLimit, 30),
          stakeMode: id,
          strategyId: strategyGridId,
          settings: botSettings,
        })
        .then(() => {
          // #region agent log
          fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
            body: JSON.stringify({
              sessionId: '281dcf',
              runId: 'pre-fix',
              hypothesisId: 'C',
              location: 'AiBotModalContext.tsx:selectBrandedStrategy',
              message: 'branded_strategy_apply_ok',
              data: { brandedStrategyId: id },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        })
        .catch((err: unknown) => {
          // #region agent log
          fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
            body: JSON.stringify({
              sessionId: '281dcf',
              runId: 'pre-fix',
              hypothesisId: 'C',
              location: 'AiBotModalContext.tsx:selectBrandedStrategy',
              message: 'branded_strategy_apply_fail',
              data: {
                brandedStrategyId: id,
                error: err instanceof Error ? err.message : 'unknown',
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          /* keep local selection even if persist fails */
        });
    },
    [botSettings, strategyGridId, tradingPairIds],
  );

  const setBotSettings = useCallback((settings: BotSettingsState) => {
    setBotSettingsState(settings);
  }, []);

  const syncBotSettingsFromPage = useCallback(
    (tradeAmount: string, duration: string, profitTarget: string, lossLimit: string) => {
      setBotSettingsState((current) => ({
        ...current,
        tradeAmount,
        duration,
        profitTarget,
        lossLimit,
      }));
    },
    [],
  );

  const syncFromBotRuntime = useCallback((bot: BotRuntimeResponse) => {
    setBotSettingsState((current) => ({
      ...current,
      toggles: {
        'auto-profit': bot.autoStopAtProfit,
        'auto-loss': bot.autoStopAtLoss,
        'signal-confirm': bot.signalConfirmationEnabled,
        notifications: bot.notificationsEnabled,
      },
      riskLevel: parseRiskLevel(bot.riskLevel),
      profitTarget: String(bot.dailyProfitTarget),
      lossLimit: String(bot.dailyLossLimit),
      tradeAmount: bot.amount > 0 ? `$${bot.amount}` : current.tradeAmount,
    }));
    const strategy = bot.strategyId?.trim().toLowerCase();
    if (strategy) {
      setStrategyGridId(strategy);
    }
  }, []);

  const persistBotSettings = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
      body: JSON.stringify({
        sessionId: '281dcf',
        runId: 'pre-fix',
        hypothesisId: 'C',
        location: 'AiBotModalContext.tsx:persistBotSettings',
        message: 'bot_settings_persist_start',
        data: {
          brandedStrategyId,
          strategyGridId,
          pairCount: tradingPairIds.length,
          riskLevel: botSettings.riskLevel,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    await aiBotService.applyControl('apply', {
      pairs: tradingPairIds.length ? tradingPairIds : undefined,
      amount: aiBotService.parseAmount(botSettings.tradeAmount),
      durationSeconds: 60,
      profitTarget: aiBotService.parseTargetAbs(botSettings.profitTarget, 50),
      lossLimit: aiBotService.parseTargetAbs(botSettings.lossLimit, 30),
      stakeMode: brandedStrategyId,
      strategyId: strategyGridId,
      settings: botSettings,
    });
  }, [botSettings, brandedStrategyId, strategyGridId, tradingPairIds]);

  const value = useMemo(
    () => ({
      activeModal,
      detailStrategyId,
      configuration,
      botSettings,
      strategies,
      strategiesLoading,
      openModal,
      closeModal,
      openStrategyDetail,
      closeStrategyDetail,
      setMarketType,
      setTradingPairIds,
      toggleTradingPair,
      setStrategyGrid,
      setBrandedStrategy,
      selectBrandedStrategy,
      setBotSettings,
      syncBotSettingsFromPage,
      syncFromBotRuntime,
      persistBotSettings,
    }),
    [
      activeModal,
      botSettings,
      closeModal,
      closeStrategyDetail,
      configuration,
      detailStrategyId,
      openModal,
      openStrategyDetail,
      persistBotSettings,
      selectBrandedStrategy,
      setBotSettings,
      setBrandedStrategy,
      setMarketType,
      setStrategyGrid,
      setTradingPairIds,
      strategies,
      strategiesLoading,
      toggleTradingPair,
      syncBotSettingsFromPage,
      syncFromBotRuntime,
    ],
  );

  return <AiBotModalContext.Provider value={value}>{children}</AiBotModalContext.Provider>;
}

export function useAiBotModals() {
  const context = useContext(AiBotModalContext);
  if (!context) {
    throw new Error('useAiBotModals must be used within AiBotModalProvider');
  }
  return context;
}

export type { BotRiskLevelId, BotSettingsToggleId, BrandedStrategyId, MarketTypeId, StrategyGridId };
