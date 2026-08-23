import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { useI18n } from '@i18n';

import {
  BRANDED_STRATEGY_OPTIONS,
  MARKET_TYPE_OPTIONS,
  STRATEGY_GRID_OPTIONS,
  TRADING_PAIR_OPTIONS,
  getDefaultBrandedStrategyId,
  getDefaultMarketTypeId,
  getDefaultStrategyGridId,
  getDefaultTradingPairId,
  type BotRiskLevelId,
  type BotSettingsToggleId,
  type BrandedStrategyId,
  type MarketTypeId,
  type StrategyGridId,
} from './modals/aiBotModals.data';
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
  tradingPairId: string;
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
  openModal: (modal: AiBotModalId) => void;
  closeModal: () => void;
  openStrategyDetail: (strategyId: BrandedStrategyId) => void;
  closeStrategyDetail: () => void;
  setMarketType: (id: MarketTypeId) => void;
  setTradingPair: (id: string) => void;
  setStrategyGrid: (id: StrategyGridId) => void;
  setBrandedStrategy: (id: BrandedStrategyId) => void;
  setBotSettings: (settings: BotSettingsState) => void;
  syncBotSettingsFromPage: (tradeAmount: string, duration: string) => void;
};

const AiBotModalContext = createContext<AiBotModalContextValue | null>(null);

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
  const [tradingPairId, setTradingPairId] = useState(getDefaultTradingPairId());
  const [strategyGridId, setStrategyGridId] = useState<StrategyGridId>(getDefaultStrategyGridId());
  const [brandedStrategyId, setBrandedStrategyId] = useState<BrandedStrategyId>(
    getDefaultBrandedStrategyId(),
  );
  const [botSettings, setBotSettingsState] = useState<BotSettingsState>(buildDefaultBotSettings());

  const configuration = useMemo<AiBotConfiguration>(() => {
    const marketOption = MARKET_TYPE_OPTIONS.find((item) => item.id === marketTypeId);
    const strategyOption = STRATEGY_GRID_OPTIONS.find((item) => item.id === strategyGridId);
    const brandedOption = BRANDED_STRATEGY_OPTIONS.find((item) => item.id === brandedStrategyId);
    const pairOption = TRADING_PAIR_OPTIONS.find((item) => item.id === tradingPairId);

    return {
      marketTypeId,
      tradingPairId,
      strategyGridId,
      brandedStrategyId,
      marketType: marketOption ? t.aiBot.modals.marketType[marketOption.titleKey] : marketTypeId,
      tradingPair: pairOption?.symbol ?? tradingPairId,
      strategy: strategyOption ? t.aiBot.modals.strategyGrid[strategyOption.titleKey] : strategyGridId,
      indicator: brandedOption
        ? t.aiBot.modals.brandedStrategy[brandedOption.titleKey]
        : brandedStrategyId,
    };
  }, [brandedStrategyId, marketTypeId, strategyGridId, t.aiBot.modals, tradingPairId]);

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
  }, []);

  const setTradingPair = useCallback((id: string) => {
    setTradingPairId(id);
  }, []);

  const setStrategyGrid = useCallback((id: StrategyGridId) => {
    setStrategyGridId(id);
  }, []);

  const setBrandedStrategy = useCallback((id: BrandedStrategyId) => {
    setBrandedStrategyId(id);
  }, []);

  const setBotSettings = useCallback((settings: BotSettingsState) => {
    setBotSettingsState(settings);
  }, []);

  const syncBotSettingsFromPage = useCallback((tradeAmount: string, duration: string) => {
    setBotSettingsState((current) => ({
      ...current,
      tradeAmount,
      duration,
    }));
  }, []);

  const value = useMemo(
    () => ({
      activeModal,
      detailStrategyId,
      configuration,
      botSettings,
      openModal,
      closeModal,
      openStrategyDetail,
      closeStrategyDetail,
      setMarketType,
      setTradingPair,
      setStrategyGrid,
      setBrandedStrategy,
      setBotSettings,
      syncBotSettingsFromPage,
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
      setBotSettings,
      setBrandedStrategy,
      setMarketType,
      setStrategyGrid,
      setTradingPair,
      syncBotSettingsFromPage,
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
