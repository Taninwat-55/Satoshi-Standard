const BASE = 'https://mempool.space/api';

export function isValidBitcoinAddress(address) {
  return /^(1|3|bc1)[a-zA-Z0-9]{25,87}$/.test(address?.trim() ?? '');
}

export async function fetchAddressInfo(address, signal) {
  const res = await fetch(`${BASE}/address/${address}`, { signal });
  if (res.status === 400) {
    const e = new Error('Invalid Bitcoin address'); e.code = 'INVALID_ADDRESS'; throw e;
  }
  if (res.status === 404) {
    const e = new Error('Address not found on-chain'); e.code = 'NOT_FOUND'; throw e;
  }
  if (!res.ok) {
    const e = new Error(`API error (${res.status})`); e.code = 'API_ERROR'; throw e;
  }
  return res.json();
}

export async function fetchAddressTransactions(address, signal) {
  const res = await fetch(`${BASE}/address/${address}/txs`, { signal });
  if (!res.ok) {
    const e = new Error(`API error (${res.status})`); e.code = 'API_ERROR'; throw e;
  }
  return res.json();
}

export function computeTxNetValue(tx, address) {
  const received = tx.vout
    .filter(o => o.scriptpubkey_address === address)
    .reduce((s, o) => s + o.value, 0);
  const sent = tx.vin
    .filter(i => i.prevout?.scriptpubkey_address === address)
    .reduce((s, i) => s + i.prevout.value, 0);
  return { received, sent, net: received - sent };
}
