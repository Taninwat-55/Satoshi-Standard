import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserMenu({ onOpenAuth, onOpenPricing }) {
    const { user, profile, isAuthenticated, signOut, isPro } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsOpen(false);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900/50 hover:bg-neutral-800 border border-white/10 rounded-xl text-sm text-neutral-300 hover:text-white transition-all"
            >
                <FaUser className="text-brand-orange" />
                Sign In
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-900/50 hover:bg-neutral-800 border border-white/10 rounded-xl text-sm transition-all"
            >
                <div className="w-7 h-7 bg-gradient-to-br from-brand-orange to-brand-orange-dark rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                        {user?.email?.charAt(0).toUpperCase()}
                    </span>
                </div>
                {isPro && (
                    <FaCrown className="text-yellow-400 text-xs" title="Pro Member" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-64 glass-panel p-2 z-50"
                        >
                            {/* User Info */}
                            <div className="px-3 py-2 border-b border-white/5 mb-2">
                                <p className="text-white font-medium text-sm truncate">
                                    {user?.email}
                                </p>
                                <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                                    {isPro ? (
                                        <>
                                            <FaCrown className="text-yellow-400" />
                                            Pro Member
                                        </>
                                    ) : (
                                        'Free Plan'
                                    )}
                                </p>
                            </div>

                            {/* Upgrade Button (for free users) */}
                            {!isPro && (
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onOpenPricing?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors mb-1"
                                >
                                    <FaCrown />
                                    Upgrade to Pro
                                </button>
                            )}

                            {/* Sign Out */}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <FaSignOutAlt />
                                Sign Out
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
