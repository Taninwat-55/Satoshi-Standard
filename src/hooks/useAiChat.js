import { useState, useEffect } from 'react';
import { mempoolProvider } from '../api/providers/mempool';
import { formatCurrency } from '../lib/currencies';

function buildSystemPrompt(items, btcPrices, preferredCurrency, fees) {
  const currency = (preferredCurrency || 'usd').toLowerCase();
  const btcPrice = btcPrices?.[currency] ?? btcPrices?.['usd'] ?? 0;
  const totalSats = items.reduce((sum, item) => sum + (item.sats || 0), 0);
  const totalBtc = totalSats / 100_000_000;
  const totalFiatValue = btcPrice ? totalBtc * btcPrice : 0;

  const itemLines = items.map(item => {
    const progress = item.sats > 0 ? (((item.currentSats || 0) / item.sats) * 100).toFixed(1) : '0.0';
    const remaining = (item.sats || 0) - (item.currentSats || 0);
    return `• ${item.name}${item.category ? ` [${item.category}]` : ''}
    Goal: ${(item.sats || 0).toLocaleString()} sats | Stacked: ${(item.currentSats || 0).toLocaleString()} sats (${progress}%) | Remaining: ${remaining.toLocaleString()} sats
    Purchase price: ${item.price} ${(item.currency || 'usd').toUpperCase()} | Added: ${new Date(item.dateAdded).toLocaleDateString()}`;
  }).join('\n\n');

  return `You are a Bitcoin portfolio assistant embedded in "Satoshi Standard", a Bitcoin finance dashboard.
Be concise and precise. Prefer sats as the primary denomination, but include fiat equivalents.
Keep responses to 2–4 sentences or short bullet points. Do not write essays.
Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

=== LIVE MARKET DATA ===
BTC Price: ${btcPrice.toLocaleString()} ${currency.toUpperCase()} per bitcoin

Mempool Fees (sat/vByte):
  Fastest (next block): ${fees?.fastestFee ?? 'N/A'} sat/vB
  ~30 min: ${fees?.halfHourFee ?? 'N/A'} sat/vB
  ~1 hour: ${fees?.hourFee ?? 'N/A'} sat/vB
  Economy: ${fees?.economyFee ?? 'N/A'} sat/vB

Fee heuristic: under 5 sat/vB = LOW (great time to transact), 5–20 = MODERATE, over 20 = HIGH (consider waiting or batching)

=== USER PORTFOLIO — ${items.length} item${items.length !== 1 ? 's' : ''} ===
Total: ${totalSats.toLocaleString()} sats ≈ ${formatCurrency(totalFiatValue, currency)} ${currency.toUpperCase()} at current price

${items.length > 0 ? itemLines : '(no items saved yet — encourage the user to add items using the converter on the left)'}`;
}

export function useAiChat() {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('satoshi-ai-messages')) ?? [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [fees, setFees] = useState(null);

  useEffect(() => {
    mempoolProvider.fetchRecommendedFees().then(d => { if (d) setFees(d); });
  }, []);

  // Persist to localStorage only when not streaming (avoid dozens of writes mid-stream)
  useEffect(() => {
    if (!isStreaming) {
      try {
        localStorage.setItem('satoshi-ai-messages', JSON.stringify(messages.slice(-20)));
      } catch { /* quota exceeded — silently fail */ }
    }
  }, [messages, isStreaming]);

  async function sendMessage(userMessage, { items, btcPrices, preferredCurrency }) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      setError('GROQ_API_KEY_MISSING');
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMsg = { role: 'user', content: userMessage, id: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);

    const assistantId = Date.now() + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantId }]);
    setIsStreaming(true);

    const systemPrompt = buildSystemPrompt(items, btcPrices, preferredCurrency, fees);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          stream: true,
          max_tokens: 1024,
          temperature: 0.7,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
            if (delta) {
              accumulated += delta;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: accumulated } : m
              ));
            }
          } catch { /* skip malformed SSE chunk */ }
        }
      }
    } catch (err) {
      setError(err.message || 'NETWORK_ERROR');
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    fees,
    sendMessage,
    clearMessages: () => setMessages([]),
  };
}
