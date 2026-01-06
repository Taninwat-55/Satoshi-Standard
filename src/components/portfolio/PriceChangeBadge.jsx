import React from 'react';
import { FaArrowDown, FaArrowUp, FaMinus } from 'react-icons/fa';

function PriceChangeBadge({ item, currentBtcPrice }) {
    if (!currentBtcPrice) return null;

    const originalSats = item.sats;
    // Calculate what the item would cost in sats TODAY
    // Formula: (Original Fiat Price / Current BTC Price) * 100,000,000
    const priceInBtc = parseFloat(item.price) / currentBtcPrice;
    const currentSatsCost = Math.round(priceInBtc * 100_000_000);

    // Calculate percentage difference
    // (Current - Original) / Original * 100
    const diffPercent = ((currentSatsCost - originalSats) / originalSats) * 100;

    // Define thresholds for "significant" change to avoid noise (e.g., < 0.5%)
    const THRESHOLD = 0.5;

    if (Math.abs(diffPercent) < THRESHOLD) {
        return (
            <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-neutral-700 text-neutral-400 border border-neutral-600' title="Price is roughly stable">
                <FaMinus size={8} />
                Stable
            </span>
        );
    }

    const isCheaperNow = diffPercent < 0; // Negative diff means current cost is LOWER than original

    return (
        <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${isCheaperNow
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
            title={`Originally: ${originalSats.toLocaleString()} sats. Now: ${currentSatsCost.toLocaleString()} sats.`}
        >
            {isCheaperNow ? <FaArrowDown size={8} /> : <FaArrowUp size={8} />}
            {Math.abs(diffPercent).toFixed(1)}% {isCheaperNow ? 'Cheaper' : 'More Exp.'}
        </span>
    );
}

export default PriceChangeBadge;
