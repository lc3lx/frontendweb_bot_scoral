import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { AppShell } from '@components/AppShell';
import { useI18n } from '@i18n';

import { getTradeById } from './data/tradeDetail.mock';
import { TradesDetailContent } from './TradesDetailContent';

/** Figma frames "9" (737:909) profit, "22" (741:17838) loss, live chart variant. */
export function TradesDetailPage() {
  const { t } = useI18n();
  const { tradeId = '' } = useParams<{ tradeId: string }>();
  const [searchParams] = useSearchParams();

  const trade = getTradeById(tradeId);
  const isLiveView = searchParams.get('live') === '1' || trade?.outcome === 'running';

  const figmaNode =
    trade?.outcome === 'loss'
      ? '741:17838'
      : isLiveView
        ? '737:909'
        : '737:909';

  useEffect(() => {
    document.title = t.tradeDetail.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t.tradeDetail.seo.description);
  }, [t.tradeDetail.seo.description, t.tradeDetail.seo.title]);

  return (
    <AppShell title={t.trades.header.title} activeNav="trades">
      <TradesDetailContent tradeId={tradeId} isLiveView={isLiveView} figmaNode={figmaNode} />
    </AppShell>
  );
}
