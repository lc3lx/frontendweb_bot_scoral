import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  isBrandedStrategyId,
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

type PersistOverrides = {
  marketTypeId?: MarketTypeId;
  tradingPairIds?: string[];
  strategyGridId?: StrategyGridId;
  brandedStrategyId?: BrandedStrategyId;
  settings?: BotSettingsState;
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

const MARKET_TYPE_IDS = new Set<MarketTypeId>(MARKET_TYPE_OPTIONS.map((item) => item.id));

function isMarketTypeId(value: string | null | undefined): value is MarketTypeId {
  return Boolean(value && MARKET_TYPE_IDS.has(value as MarketTypeId));
}

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

function filterPairsForMarket(ids: string[], marketTypeId: MarketTypeId): string[] {
  const kept = ids.filter((symbol) => pairMatchesMarketType(symbol, marketTypeId));
  if (kept.length > 0) return kept;
  const fallback = getDefaultTradingPairIds().filter((symbol) =>
    pairMatchesMarketType(symbol, marketTypeId),
  );
  return fallback.length > 0 ? fallback : [];
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

  const marketTypeIdRef = useRef(marketTypeId);
  const tradingPairIdsRef = useRef(tradingPairIds);
  const strategyGridIdRef = useRef(strategyGridId);
  const brandedStrategyIdRef = useRef(brandedStrategyId);
  const botSettingsRef = useRef(botSettings);
  const hydrateDoneRef = useRef(false);

  useEffect(() => {
    marketTypeIdRef.current = marketTypeId;
  }, [marketTypeId]);
  useEffect(() => {
    tradingPairIdsRef.current = tradingPairIds;
  }, [tradingPairIds]);
  useEffect(() => {
    strategyGridIdRef.current = strategyGridId;
  }, [strategyGridId]);
  useEffect(() => {
    brandedStrategyIdRef.current = brandedStrategyId;
  }, [brandedStrategyId]);
  useEffect(() => {
    botSettingsRef.current = botSettings;
  }, [botSettings]);

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

  const persistConfig = useCallback(async (overrides: PersistOverrides = {}) => {
    const nextMarket = overrides.marketTypeId ?? marketTypeIdRef.current;
    const nextPairs = overrides.tradingPairIds ?? tradingPairIdsRef.current;
    const nextStrategy = overrides.strategyGridId ?? strategyGridIdRef.current;
    const nextBranded = overrides.brandedStrategyId ?? brandedStrategyIdRef.current;
    const nextSettings = overrides.settings ?? botSettingsRef.current;

    // #region agent log
    fetch('http://127.0.0.1:7892/ingest/aea6d51e-f3e9-4c7e-b6b4-db55c4306e97', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '281dcf' },
      body: JSON.stringify({
        sessionId: '281dcf',
        runId: 'post-fix',
        hypothesisId: 'A',
        location: 'AiBotModalContext.tsx:persistConfig',
        message: 'bot_settings_persist',
        data: {
          marketTypeId: nextMarket,
          strategyGridId: nextStrategy,
          brandedStrategyId: nextBranded,
          pairCount: nextPairs.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    await aiBotService.applyControl('apply', {
      pairs: nextPairs.length ? nextPairs : undefined,
      amount: aiBotService.parseAmount(nextSettings.tradeAmount),
      durationSeconds: 60,
      profitTarget: aiBotService.parseTargetAbs(nextSettings.profitTarget, 50),
      lossLimit: aiBotService.parseTargetAbs(nextSettings.lossLimit, 30),
      stakeMode: nextBranded,
      strategyId: nextStrategy,
      marketTypeId: nextMarket,
      settings: nextSettings,
    });
  }, []);

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

  const setMarketType = useCallback(
    (id: MarketTypeId) => {
      const nextPairs = filterPairsForMarket(tradingPairIdsRef.current, id);
      setMarketTypeId(id);
      setTradingPairIdsState(nextPairs);
      marketTypeIdRef.current = id;
      tradingPairIdsRef.current = nextPairs;
      void persistConfig({ marketTypeId: id, tradingPairIds: nextPairs }).catch(() => {});
    },
    [persistConfig],
  );

  const setTradingPairIds = useCallback(
    (ids: string[]) => {
      const next = ids.length > 0 ? ids : tradingPairIdsRef.current;
      setTradingPairIdsState(next);
      tradingPairIdsRef.current = next;
      void persistConfig({ tradingPairIds: next }).catch(() => {});
    },
    [persistConfig],
  );

  const toggleTradingPair = useCallback(
    (id: string) => {
      const current = tradingPairIdsRef.current;
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      const resolved = next.length > 0 ? next : current;
      setTradingPairIdsState(resolved);
      tradingPairIdsRef.current = resolved;
      void persistConfig({ tradingPairIds: resolved }).catch(() => {});
    },
    [persistConfig],
  );

  const setStrategyGrid = useCallback(
    (id: StrategyGridId) => {
      setStrategyGridId(id);
      strategyGridIdRef.current = id;
      void persistConfig({ strategyGridId: id }).catch(() => {});
    },
    [persistConfig],
  );

  const setBrandedStrategy = useCallback((id: BrandedStrategyId) => {
    setBrandedStrategyId(id);
    brandedStrategyIdRef.current = id;
  }, []);

  const selectBrandedStrategy = useCallback(
    (id: BrandedStrategyId) => {
      setBrandedStrategyId(id);
      brandedStrategyIdRef.current = id;
      setActiveModal(null);
      setDetailStrategyId(null);
      void persistConfig({ brandedStrategyId: id }).catch(() => {});
    },
    [persistConfig],
  );

  const setBotSettings = useCallback((settings: BotSettingsState) => {
    setBotSettingsState(settings);
    botSettingsRef.current = settings;
  }, []);

  const syncBotSettingsFromPage = useCallback(
    (tradeAmount: string, duration: string, profitTarget: string, lossLimit: string) => {
      setBotSettingsState((current) => {
        const next = {
          ...current,
          tradeAmount,
          duration,
          profitTarget,
          lossLimit,
        };
        botSettingsRef.current = next;
        return next;
      });
    },
    [],
  );

  const syncFromBotRuntime = useCallback((bot: BotRuntimeResponse) => {
    setBotSettingsState((current) => {
      const next = {
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
      };
      botSettingsRef.current = next;
      return next;
    });

    const strategy = bot.strategyId?.trim().toLowerCase();
    if (strategy) {
      setStrategyGridId(strategy);
      strategyGridIdRef.current = strategy;
    }

    if (isBrandedStrategyId(bot.stakeMode)) {
      setBrandedStrategyId(bot.stakeMode);
      brandedStrategyIdRef.current = bot.stakeMode;
    }

    if (isMarketTypeId(bot.marketTypeId)) {
      setMarketTypeId(bot.marketTypeId);
      marketTypeIdRef.current = bot.marketTypeId;
    }

    const assets = bot.assets?.length ? bot.assets : bot.asset ? [bot.asset] : null;
    if (assets?.length) {
      setTradingPairIdsState(assets);
      tradingPairIdsRef.current = assets;
    }

    hydrateDoneRef.current = true;
  }, []);

  const persistBotSettings = useCallback(async () => {
    await persistConfig();
  }, [persistConfig]);

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
