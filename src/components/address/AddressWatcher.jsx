import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import toast from 'react-hot-toast';
import {
  FiSearch, FiAlertTriangle, FiMapPin, FiCopy, FiExternalLink,
  FiArrowDownLeft, FiArrowUpRight, FiZap,
} from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';
import { useAddressData } from '../../hooks/useAddressData';
import { useCurrencyPreference } from '../../contexts/CurrencyPreferenceContext';
import { formatCurrency } from '../../lib/currencies';
import { Badge } from '../ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';

function getAddressErrorContent(error) {
  if (error?.code === 'INVALID_ADDRESS') return { title: 'Invalid address format', detail: 'Bitcoin addresses start with 1, 3, or bc1.' };
  if (error?.code === 'NOT_FOUND') return { title: 'Address not found on-chain', detail: 'This address has never transacted. It may be brand new or contain a typo.' };
  if (error?.code === 'API_ERROR') return { title: 'Mempool.space unreachable', detail: 'The API returned an error. Try again in a few seconds.' };
  return { title: 'Network error', detail: 'Check your internet connection and try again.' };
}

function formatSats(sats) {
  return Math.abs(sats).toLocaleString();
}

function StatCard({ label, sats, fiatValue, preferredCurrency, btcPrices, sub, color }) {
  const fiat = btcPrices && fiatValue !== undefined
    ? formatCurrency(fiatValue, preferredCurrency)
    : null;

  return (
    <div className="glass-panel p-4 flex flex-col gap-1">
      <p className="data-label">{label}</p>
      <p className={`data-value ${color ?? ''}`}>
        {formatSats(sats)} <span className="text-xs font-normal text-neutral-400">sats</span>
      </p>
      {fiat && <p className="text-xs text-neutral-500">≈ {fiat}</p>}
      {sub && <p className="text-[10px] text-neutral-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function TransactionRow({ tx, btcPrices, preferredCurrency }) {
  const isIn = tx.direction === 'in';
  const fiatValue = btcPrices
    ? (Math.abs(tx.net) / 1e8) * (btcPrices[preferredCurrency] ?? btcPrices['usd'] ?? 0)
    : null;

  const dateStr = tx.confirmed && tx.blockTime
    ? new Date(tx.blockTime * 1000).toLocaleDateString()
    : null;

  return (
    <TableRow>
      <TableCell className="w-10 pr-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center
          ${isIn ? 'bg-green-500/10' : 'bg-red-500/10'}`}
        >
          {isIn
            ? <FiArrowDownLeft className="text-green-400" size={13} />
            : <FiArrowUpRight className="text-red-400" size={13} />
          }
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-neutral-400 max-w-[120px]" title={tx.txid}>
        {tx.txid.slice(0, 8)}…{tx.txid.slice(-6)}
      </TableCell>
      <TableCell className="text-xs text-neutral-500">
        {dateStr ?? '—'}
      </TableCell>
      <TableCell>
        {tx.confirmed
          ? <Badge variant="green">Confirmed</Badge>
          : <Badge variant="amber">Pending</Badge>
        }
      </TableCell>
      <TableCell className="text-right">
        <p className={`text-sm font-semibold tabular-nums ${isIn ? 'text-green-400' : 'text-red-400'}`}>
          {isIn ? '+' : '-'}{formatSats(tx.net)} sats
        </p>
        {fiatValue !== null && (
          <p className="text-[10px] text-neutral-600">≈ {formatCurrency(fiatValue, preferredCurrency)}</p>
        )}
      </TableCell>
      <TableCell className="w-8 pl-0">
        <a
          href={`https://mempool.space/tx/${tx.txid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-600 hover:text-brand-orange transition-colors"
          title="View on mempool.space"
          onClick={e => e.stopPropagation()}
        >
          <FiExternalLink size={13} />
        </a>
      </TableCell>
    </TableRow>
  );
}

export default function AddressWatcher({ btcPrices }) {
  const {
    inputValue, setInputValue,
    currentAddress, status, error,
    addressInfo, confirmedBalance, unconfirmedBalance, totalTxCount, transactions,
    pinnedAddresses, pinAddress, unpinAddress, loadPinnedAddress,
    isCurrentAddressPinned,
    lookupAddress, clearAddress,
  } = useAddressData();

  const { preferredCurrency } = useCurrencyPreference();

  const btcPrice = btcPrices?.[preferredCurrency] ?? btcPrices?.['usd'] ?? 0;
  const confirmedFiat = (confirmedBalance / 1e8) * btcPrice;
  const unconfirmedFiat = (Math.abs(unconfirmedBalance) / 1e8) * btcPrice;

  function handleKeyDown(e) {
    if (e.key === 'Enter') lookupAddress(inputValue);
  }

  function handleCopyAddress() {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress);
    toast.success('Address copied!');
  }

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* Input */}
      <div className="glass-panel p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={14} />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Bitcoin address (1..., 3..., bc1...)"
              className="glass-input pl-9 pr-4 py-2.5 w-full text-sm"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <button
            onClick={() => lookupAddress(inputValue)}
            disabled={!inputValue.trim() || status === 'loading'}
            className="btn-primary w-auto px-4 py-2.5 gap-1.5"
          >
            <FiSearch size={14} />
            <span>Lookup</span>
          </button>
        </div>

        {/* Pinned pills */}
        {pinnedAddresses.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider shrink-0">Pinned:</span>
            {pinnedAddresses.map(addr => (
              <button
                key={addr}
                onClick={() => loadPinnedAddress(addr)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all
                  ${currentAddress === addr
                    ? 'border-brand-orange/50 bg-brand-orange/10 text-brand-orange'
                    : 'border-white/10 bg-neutral-900/40 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
              >
                <FiMapPin size={9} />
                {addr.slice(0, 8)}…{addr.slice(-6)}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); unpinAddress(addr); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); unpinAddress(addr); }}}
                  className="ml-0.5 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
                  title="Unpin"
                >×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status: idle */}
      {status === 'idle' && (
        <div className="glass-panel p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
            <FaBitcoin className="text-brand-orange text-2xl" />
          </div>
          <p className="text-sm font-semibold text-white">Watch any Bitcoin address</p>
          <p className="text-xs text-neutral-500 max-w-xs">
            Enter any on-chain address to see its balance, transaction history, and more — no login required.
          </p>
        </div>
      )}

      {/* Status: loading */}
      {status === 'loading' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-panel p-4">
                <Skeleton height={10} width={60} className="mb-2" />
                <Skeleton height={22} width={80} className="mb-1" />
                <Skeleton height={10} width={50} />
              </div>
            ))}
          </div>
          <div className="glass-panel p-4 flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton circle height={32} width={32} />
                <div className="flex-1">
                  <Skeleton height={12} width={120} className="mb-1" />
                  <Skeleton height={10} width={70} />
                </div>
                <Skeleton height={14} width={80} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status: error */}
      {status === 'error' && error && (
        <div className="glass-panel p-8 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <FiAlertTriangle className="text-red-400 text-xl" />
          </div>
          <p className="text-sm font-semibold text-white">{getAddressErrorContent(error).title}</p>
          <p className="text-xs text-neutral-500">{getAddressErrorContent(error).detail}</p>
          <button onClick={() => lookupAddress(currentAddress)} className="btn-ghost mt-1">
            Try again
          </button>
        </div>
      )}

      {/* Status: success */}
      {status === 'success' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Address header */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <FiZap className="text-brand-orange shrink-0" size={13} />
                <span className="text-xs font-mono text-neutral-400 truncate" title={currentAddress}>
                  {currentAddress?.slice(0, 12)}…{currentAddress?.slice(-8)}
                </span>
                {isCurrentAddressPinned && <Badge variant="orange"><FiMapPin size={9} />Pinned</Badge>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={handleCopyAddress} className="btn-icon" title="Copy address">
                  <FiCopy size={13} />
                </button>
                <button
                  onClick={() => isCurrentAddressPinned ? unpinAddress(currentAddress) : pinAddress(currentAddress)}
                  className={`btn-icon ${isCurrentAddressPinned ? 'text-brand-orange' : ''}`}
                  title={isCurrentAddressPinned ? 'Unpin address' : 'Pin address (max 5)'}
                >
                  <FiMapPin size={13} />
                </button>
                <a
                  href={`https://mempool.space/address/${currentAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon"
                  title="View on mempool.space"
                >
                  <FiExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Confirmed"
                sats={confirmedBalance}
                fiatValue={btcPrices ? confirmedFiat : undefined}
                preferredCurrency={preferredCurrency}
                btcPrices={btcPrices}
                sub="on-chain balance"
              />
              <StatCard
                label="Unconfirmed"
                sats={unconfirmedBalance}
                fiatValue={btcPrices ? unconfirmedFiat : undefined}
                preferredCurrency={preferredCurrency}
                btcPrices={btcPrices}
                sub="in mempool"
                color={unconfirmedBalance > 0 ? 'text-green-400' : unconfirmedBalance < 0 ? 'text-red-400' : 'text-neutral-400'}
              />
              <StatCard
                label="Transactions"
                sats={totalTxCount}
                preferredCurrency={preferredCurrency}
                btcPrices={null}
                sub={`${(addressInfo?.chain_stats?.tx_count ?? 0).toLocaleString()} confirmed`}
              />
            </div>

            {/* Transaction list */}
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title">Recent Transactions</h3>
                {totalTxCount > 0 && (
                  <span className="text-[10px] text-neutral-600">
                    Showing {transactions.length} of {totalTxCount.toLocaleString()}
                  </span>
                )}
              </div>

              {transactions.length === 0 ? (
                <p className="text-sm text-neutral-600 text-center py-6">No transaction history yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 pr-0"></TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-8 pl-0"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TransactionRow
                        key={tx.txid}
                        tx={tx}
                        btcPrices={btcPrices}
                        preferredCurrency={preferredCurrency}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}

              {totalTxCount > 10 && (
                <a
                  href={`https://mempool.space/address/${currentAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 mt-3 text-xs text-neutral-600 hover:text-brand-orange transition-colors"
                >
                  View full history on mempool.space
                  <FiExternalLink size={11} />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
