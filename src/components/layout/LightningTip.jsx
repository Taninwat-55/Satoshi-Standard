import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaBolt, FaCopy, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function LightningTip() {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Get address from env, default to developer's if not set
    // Format: user@domain.com
    const lightningAddress = import.meta.env.VITE_LIGHTNING_ADDRESS || 'unluckyfortune785@walletofsatoshi.com';

    // Convert Lightning Address to LNURL-like format for QR (or just use the address for modern wallets)
    // Most modern wallets support scanning the address directly or we can use `lightning:{address}`
    const qrValue = `lightning:${lightningAddress}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(lightningAddress);
        setCopied(true);
        toast.success('Address copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-brand-orange text-white rounded-full shadow-lg shadow-orange-500/30 hover:bg-brand-orange-dark hover:scale-110 transition-all z-40 group"
                title="Send a Tip (Lightning)"
            >
                <FaBolt className="text-xl group-hover:animate-pulse" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-neutral-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="text-center space-y-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-orange/10 text-brand-orange mb-2">
                                    <FaBolt className="text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Value for Value</h3>
                                <p className="text-sm text-neutral-400">
                                    Support this project with satoshis!
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-xl mx-auto w-fit shadow-inner">
                                <QRCodeSVG
                                    value={qrValue}
                                    size={200}
                                    level="M"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="bg-neutral-800/50 p-3 rounded-lg flex items-center justify-between border border-white/5 group hover:border-brand-orange/30 transition-colors">
                                <code className="text-sm text-brand-orange font-mono truncate mr-2">
                                    {lightningAddress}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-neutral-400 hover:text-white transition-colors"
                                    title="Copy Address"
                                >
                                    {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
                                </button>
                            </div>

                            <p className="text-xs text-neutral-500">
                                Scan with Zeus, Phoenix, CashApp, or any Lightning wallet.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
