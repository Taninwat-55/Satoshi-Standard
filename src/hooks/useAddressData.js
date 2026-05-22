import { useState, useMemo, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  isValidBitcoinAddress,
  fetchAddressInfo,
  fetchAddressTransactions,
  computeTxNetValue,
} from '../api/addressApi';

export function useAddressData() {
  const [pinnedAddresses, setPinnedAddresses] = useLocalStorage('satoshi-pinned-addresses', []);
  const [inputValue, setInputValue] = useState('');
  const [currentAddress, setCurrentAddress] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [addressInfo, setAddressInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const confirmedBalance = useMemo(() => {
    if (!addressInfo) return 0;
    const s = addressInfo.chain_stats;
    return s.funded_txo_sum - s.spent_txo_sum;
  }, [addressInfo]);

  const unconfirmedBalance = useMemo(() => {
    if (!addressInfo) return 0;
    const s = addressInfo.mempool_stats;
    return s.funded_txo_sum - s.spent_txo_sum;
  }, [addressInfo]);

  const totalTxCount = useMemo(() => {
    if (!addressInfo) return 0;
    return addressInfo.chain_stats.tx_count + addressInfo.mempool_stats.tx_count;
  }, [addressInfo]);

  async function lookupAddress(address) {
    const trimmed = address?.trim();
    if (!trimmed) return;

    if (!isValidBitcoinAddress(trimmed)) {
      setError({ code: 'INVALID_ADDRESS', message: 'Invalid Bitcoin address format' });
      setStatus('error');
      setCurrentAddress(trimmed);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setError(null);
    setStatus('loading');
    setCurrentAddress(trimmed);
    setAddressInfo(null);
    setTransactions([]);

    try {
      const [info, txsRaw] = await Promise.all([
        fetchAddressInfo(trimmed, signal),
        fetchAddressTransactions(trimmed, signal),
      ]);

      if (signal.aborted) return;

      const processed = txsRaw.map(tx => {
        const { received, sent, net } = computeTxNetValue(tx, trimmed);
        return {
          txid: tx.txid,
          net,
          received,
          sent,
          fee: tx.fee ?? 0,
          confirmed: tx.status?.confirmed ?? false,
          blockTime: tx.status?.block_time ?? null,
          direction: net >= 0 ? 'in' : 'out',
        };
      });

      setAddressInfo(info);
      setTransactions(processed.slice(0, 10));
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError({ code: err.code ?? 'NETWORK_ERROR', message: err.message });
      setStatus('error');
    }
  }

  function pinAddress(address) {
    if (!address) return;
    setPinnedAddresses(prev => {
      const filtered = prev.filter(a => a !== address);
      return [address, ...filtered].slice(0, 5);
    });
  }

  function unpinAddress(address) {
    setPinnedAddresses(prev => prev.filter(a => a !== address));
  }

  function loadPinnedAddress(address) {
    setInputValue(address);
    lookupAddress(address);
  }

  function clearAddress() {
    abortRef.current?.abort();
    setCurrentAddress(null);
    setStatus('idle');
    setAddressInfo(null);
    setTransactions([]);
    setError(null);
  }

  return {
    inputValue,
    setInputValue,
    currentAddress,
    status,
    error,
    addressInfo,
    confirmedBalance,
    unconfirmedBalance,
    totalTxCount,
    transactions,
    pinnedAddresses,
    pinAddress,
    unpinAddress,
    loadPinnedAddress,
    isCurrentAddressPinned: currentAddress ? pinnedAddresses.includes(currentAddress) : false,
    lookupAddress,
    clearAddress,
  };
}
