export type NotificationTone = 'success' | 'info' | 'warning' | 'error' | 'neutral';

export type NotificationMessageKey =
  | 'accountApproved'
  | 'activationSuccess'
  | 'botStarted'
  | 'newSignalDetected'
  | 'liveTradeStarted'
  | 'tradeProfit'
  | 'tradeLoss'
  | 'profitTargetReached'
  | 'lossLimitReached'
  | 'strategyUpdated'
  | 'botStopped'
  | 'indicatorUpdated';

export type NotificationItem = {
  id: string;
  tone: NotificationTone;
  messageKey: NotificationMessageKey;
};

/** 12 notification cards from Figma page 25 (744:18579). */
export const NOTIFICATION_ITEMS: NotificationItem[] = [
  { id: 'account-approved', tone: 'success', messageKey: 'accountApproved' },
  { id: 'activation-success', tone: 'success', messageKey: 'activationSuccess' },
  { id: 'bot-started', tone: 'info', messageKey: 'botStarted' },
  { id: 'new-signal', tone: 'warning', messageKey: 'newSignalDetected' },
  { id: 'live-trade-started', tone: 'info', messageKey: 'liveTradeStarted' },
  { id: 'trade-profit', tone: 'success', messageKey: 'tradeProfit' },
  { id: 'trade-loss', tone: 'error', messageKey: 'tradeLoss' },
  { id: 'profit-target', tone: 'success', messageKey: 'profitTargetReached' },
  { id: 'loss-limit', tone: 'error', messageKey: 'lossLimitReached' },
  { id: 'strategy-updated', tone: 'neutral', messageKey: 'strategyUpdated' },
  { id: 'bot-stopped', tone: 'neutral', messageKey: 'botStopped' },
  { id: 'indicator-updated', tone: 'neutral', messageKey: 'indicatorUpdated' },
];
