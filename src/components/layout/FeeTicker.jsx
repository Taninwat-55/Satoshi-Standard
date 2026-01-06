import React, { useState, useEffect } from 'react';
import { mempoolProvider } from '../../api/providers/mempool';
import { FaGasPump } from 'react-icons/fa';

export default function FeeTicker() {
    const [fees, setFees] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFees = async () => {
            const data = await mempoolProvider.fetchRecommendedFees();
            if (data) {
                setFees(data);
                setLoading(false);
            }
        };

        fetchFees();
        // Refresh every 60 seconds
        const interval = setInterval(fetchFees, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !fees) return null;

    // Use "fastestFee" (High Priority)
    return (
        <div
            className="flex items-center gap-2 bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-neutral-800 transition-colors cursor-help"
            title={`Low: ${fees.hourFee} sat/vB | Medium: ${fees.halfHourFee} sat/vB | High: ${fees.fastestFee} sat/vB`}
        >
            <FaGasPump className="text-brand-orange text-xs" />
            <span className="text-xs font-medium text-neutral-300">
                {fees.fastestFee} sat/vB
            </span>
        </div>
    );
}
