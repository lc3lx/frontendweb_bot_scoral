import { BotSettingsModal } from './modals/BotSettingsModal';
import { MarketTypeModal } from './modals/MarketTypeModal';
import { StrategyDetailModal } from './modals/StrategyDetailModal';
import { StrategyGridModal } from './modals/StrategyGridModal';
import { TechnicalIndicatorModal } from './modals/TechnicalIndicatorModal';
import { TradingPairModal } from './modals/TradingPairModal';
import { useAiBotModals } from './AiBotModalContext';

export function AiBotModalHost() {
  const {
    activeModal,
    detailStrategyId,
    configuration,
    botSettings,
    strategies,
    strategiesLoading,
    closeModal,
    closeStrategyDetail,
    openStrategyDetail,
    setMarketType,
    setTradingPairIds,
    toggleTradingPair,
    setStrategyGrid,
    setBrandedStrategy,
    setBotSettings,
    persistBotSettings,
  } = useAiBotModals();

  return (
    <>
      <MarketTypeModal
        isOpen={activeModal === 'marketType'}
        selectedId={configuration.marketTypeId}
        onClose={closeModal}
        onSelect={setMarketType}
      />

      <StrategyGridModal
        isOpen={activeModal === 'strategyGrid'}
        selectedId={configuration.strategyGridId}
        strategies={strategies}
        loading={strategiesLoading}
        onClose={closeModal}
        onSelect={setStrategyGrid}
      />

      <TradingPairModal
        isOpen={activeModal === 'tradingPair'}
        selectedIds={configuration.tradingPairIds}
        onClose={closeModal}
        onToggle={toggleTradingPair}
        onSelectAll={setTradingPairIds}
        onClearAll={() => setTradingPairIds([])}
      />

      <TechnicalIndicatorModal
        isOpen={activeModal === 'technicalIndicator'}
        selectedId={configuration.brandedStrategyId}
        onClose={closeModal}
        onSelect={setBrandedStrategy}
        onViewDetails={openStrategyDetail}
      />

      <StrategyDetailModal
        isOpen={activeModal === 'strategyDetail'}
        strategyId={detailStrategyId}
        selected={detailStrategyId === configuration.brandedStrategyId}
        onClose={closeModal}
        onBack={closeStrategyDetail}
        onConfirm={(id) => {
          setBrandedStrategy(id);
          closeModal();
        }}
      />

      <BotSettingsModal
        isOpen={activeModal === 'botSettings'}
        settings={botSettings}
        onClose={closeModal}
        onChange={setBotSettings}
        onSave={() => {
          void persistBotSettings().finally(() => closeModal());
        }}
      />
    </>
  );
}
