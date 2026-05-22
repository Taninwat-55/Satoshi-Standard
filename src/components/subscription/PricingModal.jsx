import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCrown, FaCheck, FaBolt, FaChartLine, FaFileCsv, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { openCheckout } from '../../lib/stripe';
import { toast } from 'react-hot-toast';

const FREE_FEATURES = [
    'Unlimited conversions',
    'Save up to 20 items',
    'Basic price history (30 days)',
    'JSON import/export',
];

const PRO_FEATURES = [
    'Everything in Free',
    'Unlimited saved items',
    'Extended history (1 year+)',
    'CSV portfolio export',
    'Real-time price alerts',
    'Priority support',
];

export default function PricingModal({ isOpen, onClose }) {
    const { isAuthenticated, isPro } = useAuth();

    const handleUpgrade = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in first');
            onClose();
            return;
        }

        if (isPro) {
            toast('You already have Pro!', { icon: '👑' });
            return;
        }

        try {
            await openCheckout();
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to open checkout');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-4xl glass-panel p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 text-yellow-400 mb-3">
                            <FaCrown className="text-2xl" />
                            <span className="text-sm font-semibold tracking-wide uppercase">
                                Satoshi Pro
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Upgrade Your Bitcoin Experience
                        </h2>
                        <p className="text-neutral-400">
                            Unlock powerful features for serious Bitcoiners
                        </p>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free Tier */}
                        <div className="bg-neutral-900/50 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-1">Free</h3>
                            <p className="text-neutral-400 text-sm mb-4">
                                Perfect for getting started
                            </p>
                            <div className="text-3xl font-bold text-white mb-6">
                                $0
                                <span className="text-sm font-normal text-neutral-400">
                                    /forever
                                </span>
                            </div>
                            <ul className="space-y-3">
                                {FREE_FEATURES.map((feature, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-sm text-neutral-300"
                                    >
                                        <FaCheck className="text-green-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                disabled
                                className="w-full mt-6 py-3 bg-neutral-800 text-neutral-400 rounded-xl cursor-not-allowed"
                            >
                                Current Plan
                            </button>
                        </div>

                        {/* Pro Tier */}
                        <div className="relative bg-gradient-to-br from-orange-900/30 to-yellow-900/20 rounded-2xl p-6 border border-yellow-500/30 shadow-lg shadow-orange-500/10">
                            {/* Popular Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-semibold text-black">
                                MOST POPULAR
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                                Pro
                                <FaCrown className="text-yellow-400 text-sm" />
                            </h3>
                            <p className="text-neutral-400 text-sm mb-4">
                                For serious Bitcoiners
                            </p>
                            <div className="text-3xl font-bold text-white mb-6">
                                $9
                                <span className="text-sm font-normal text-neutral-400">
                                    /month
                                </span>
                            </div>
                            <ul className="space-y-3">
                                {PRO_FEATURES.map((feature, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-sm text-neutral-200"
                                    >
                                        <FaCheck className="text-yellow-400 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleUpgrade}
                                disabled={isPro}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPro ? 'Active' : 'Upgrade to Pro'}
                            </button>
                        </div>
                    </div>

                    {/* Pro Features Highlight */}
                    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: FaBolt, label: 'Speed', desc: 'Faster data' },
                            { icon: FaChartLine, label: 'Charts', desc: '1 year history' },
                            { icon: FaFileCsv, label: 'Export', desc: 'CSV download' },
                            { icon: FaBell, label: 'Alerts', desc: 'Price notifications' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="text-center p-4 bg-neutral-900/30 rounded-xl"
                            >
                                <item.icon className="text-2xl text-yellow-400 mx-auto mb-2" />
                                <p className="text-sm font-medium text-white">{item.label}</p>
                                <p className="text-xs text-neutral-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
