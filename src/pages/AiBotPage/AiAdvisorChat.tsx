import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { aiBotAssets } from '@assets';
import { useI18n } from '@i18n';
import { tradeService } from '@services/trades';
import { aiApi, ApiClientError, marketApi, tradesApi, type AiChatTurn } from '@shared/api';
import { formatPairLabel } from '@shared/market/pairDisplay';

import styles from './AiBotPage.module.css';

type AiAdvisorChatProps = {
  pairIds: string[];
  amountLabel: string;
};

type ChatMsg = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  source?: string;
};

function isAllPairs(ids: string[]): boolean {
  return (
    ids.length === 0 ||
    ids.some((id) => id.trim() === '*' || id.trim().toLowerCase() === 'all')
  );
}

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readAmount(label: string): number {
  const numeric = Number.parseFloat(label.replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function AiAdvisorChat({ pairIds, amountLabel }: AiAdvisorChatProps) {
  const { t, locale } = useI18n();
  const copy = t.aiBot.advisor;
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [asset, setAsset] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement | null>(null);
  const welcomed = useRef(false);

  const concrete = useMemo(
    () => pairIds.map((id) => id.trim()).filter((id) => id && id !== '*' && id.toLowerCase() !== 'all'),
    [pairIds],
  );

  useEffect(() => {
    if (welcomed.current) return;
    welcomed.current = true;
    setMessages([{ id: nextId(), role: 'ai', text: copy.welcome }]);
  }, [copy.welcome]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    let cancelled = false;
    if (!isAllPairs(pairIds)) {
      setOptions(concrete);
      setAsset((current) => (concrete.includes(current) ? current : (concrete[0] ?? '')));
      return;
    }
    void marketApi
      .assets()
      .then((res) => {
        if (cancelled) return;
        const symbols = res.assets.filter((item) => item.available && item.symbol).map((item) => item.symbol);
        setOptions(symbols);
        setAsset((current) => (symbols.includes(current) ? current : (symbols[0] ?? '')));
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pairIds, concrete]);

  async function analyze() {
    if (!asset || busy) return;
    setOpen(true);
    const asked = copy.youAsked.replace('{pair}', formatPairLabel(asset));
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: asked }]);
    setBusy(true);
    try {
      const advice = await aiApi.advise(asset, locale);
      const decision = advice.direction === 'Call' || advice.direction === 'Put' ? advice.direction : 'Wait';
      const lowPayout = (advice.blockReason ?? '').includes('LOW_PAYOUT') || decision === 'Wait';
      if (lowPayout && ((advice.blockReason ?? '').includes('LOW_PAYOUT') || advice.summary.includes('نسبة'))) {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'ai', text: copy.skippedPayout, source: advice.source },
        ]);
        return;
      }
      if (decision !== 'Call' && decision !== 'Put') {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'ai', text: advice.summary, source: advice.source },
        ]);
        return;
      }

      const amount = readAmount(amountLabel);
      if (amount <= 0) {
        setMessages((prev) => [...prev, { id: nextId(), role: 'ai', text: copy.badAmount }]);
        return;
      }

      const [running, pending] = await Promise.all([
        tradesApi.list({ status: 'Running', page: 1, pageSize: 1 }),
        tradesApi.list({ status: 'Pending', page: 1, pageSize: 1 }),
      ]);
      if (running.items.length > 0 || pending.items.length > 0) {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'ai', text: `${advice.summary} ${copy.openTrade}`, source: advice.source },
        ]);
        return;
      }

      const side = decision === 'Call' ? copy.sideUp : copy.sideDown;
      await tradeService.placeTrade({
        direction: decision === 'Call' ? 'up' : 'down',
        pair: advice.asset || asset,
        platform: 'quotex',
        amount,
        durationLabel: '5m',
        strategy: 'rsi',
        indicator: 'rsi',
      });
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'ai',
          text: `${advice.summary} ${copy.entered.replace('{side}', side)}`,
          source: advice.source,
        },
      ]);
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : '';
      const payout = /payout|نسبة/i.test(message);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'ai',
          text: payout ? copy.skippedPayout : copy.placeFailed.replace('{message}', message),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    const history: AiChatTurn[] = messages.slice(-6).map((msg) => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      text: msg.text,
    }));
    setDraft('');
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setBusy(true);
    try {
      const reply = await aiApi.chat(text, locale, history);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'ai', text: reply.reply, source: reply.source },
      ]);
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : '';
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'ai', text: copy.placeFailed.replace('{message}', message) },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const body = (
    <div className={styles.advisorDock} data-open={open ? 'true' : 'false'}>
      {open ? (
        <section className={styles.advisorPanel} aria-label={copy.title}>
          <header className={styles.advisorHead}>
            <div className={styles.advisorBrand}>
              <img className={styles.advisorBrandMark} src={aiBotAssets.scarAiMark} alt="" />
              <div>
                <h2 className={styles.advisorTitle}>{copy.title}</h2>
                <p className={styles.advisorHint}>{copy.hint}</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.advisorIconBtn}
              aria-label={copy.close}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className={styles.advisorForm}>
            <select
              className={styles.advisorSelect}
              aria-label={copy.pair}
              value={asset}
              disabled={options.length === 0 || busy}
              onChange={(event) => setAsset(event.target.value)}
            >
              {options.length === 0 ? <option value="">{copy.emptyPairs}</option> : null}
              {options.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {formatPairLabel(symbol)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.advisorPrimary}
              disabled={!asset || busy}
              onClick={() => void analyze()}
            >
              {busy ? copy.analyzing : copy.analyze}
            </button>
          </div>

          <div className={styles.advisorLog} ref={logRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.role === 'user'
                    ? `${styles.advisorBubble} ${styles.advisorBubbleUser}`
                    : styles.advisorBubble
                }
              >
                <span>{msg.text}</span>
                {msg.role === 'ai' && msg.source ? (
                  <span className={styles.advisorSource}>
                    {msg.source === 'openrouter' ? copy.sourceAi : copy.sourceRules}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <form
            className={styles.advisorComposer}
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <input
              className={styles.advisorInput}
              value={draft}
              placeholder={copy.chatPlaceholder}
              disabled={busy}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="submit"
              className={styles.advisorPrimary}
              disabled={busy || draft.trim().length === 0}
            >
              {copy.send}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className={styles.advisorFab}
        aria-label={open ? copy.close : copy.open}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.advisorFabGlow} aria-hidden="true" />
        <img className={styles.advisorFabMark} src={aiBotAssets.scarAiMark} alt="" />
        <span className={styles.advisorFabBadge}>AI</span>
      </button>
    </div>
  );

  if (typeof document === 'undefined') return body;
  return createPortal(body, document.body);
}
