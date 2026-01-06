import React from 'react';
import { useSavedItems } from '../../contexts/SavedItemsContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SatsToggle() {
    const { satsMode, setSatsMode } = useSavedItems();

    return (
        <button
            onClick={() => setSatsMode(!satsMode)}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all
                ${satsMode
                    ? 'bg-brand-orange text-white border-brand-orange shadow-[0_0_10px_rgba(247,147,26,0.3)]'
                    : 'bg-neutral-800/50 text-neutral-400 border-white/5 hover:bg-neutral-800 hover:text-white'
                }
            `}
            title={satsMode ? "Disable Sats-Only Mode" : "Enable Sats-Only Mode"}
        >
            {satsMode ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
            <span className="text-xs font-medium">
                {satsMode ? 'Sats Only' : 'Fiat Visible'}
            </span>
        </button>
    );
}
