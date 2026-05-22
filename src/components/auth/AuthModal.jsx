import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes, FaEnvelope, FaLock, FaBitcoin } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose }) {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {
                if (password !== confirmPassword) {
                    toast.error('Passwords do not match');
                    return;
                }
                if (password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    return;
                }
                await signUp(email, password);
                toast.success('Account created! Check your email to confirm.');
                onClose();
            } else {
                await signIn(email, password);
                toast.success('Welcome back!');
                onClose();
            }
        } catch (error) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setPassword('');
        setConfirmPassword('');
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
                    className="relative w-full max-w-md glass-panel p-8"
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
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-orange to-brand-orange-dark rounded-2xl shadow-lg shadow-orange-500/20 mb-4">
                            <FaBitcoin className="text-3xl text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-neutral-400 mt-2">
                            {mode === 'signin'
                                ? 'Sign in to sync your portfolio across devices'
                                : 'Join to save your Satoshi conversions'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-orange/50 focus:ring-2 focus:ring-brand-orange/20 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                minLength={6}
                                className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-orange/50 focus:ring-2 focus:ring-brand-orange/20 transition-all"
                            />
                        </div>

                        {/* Confirm Password (Sign Up only) */}
                        {mode === 'signup' && (
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-orange/50 focus:ring-2 focus:ring-brand-orange/20 transition-all"
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? 'Loading...'
                                : mode === 'signin'
                                    ? 'Sign In'
                                    : 'Create Account'}
                        </button>
                    </form>

                    {/* Switch Mode */}
                    <p className="text-center text-neutral-400 mt-6">
                        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={switchMode}
                            className="text-brand-orange hover:underline font-medium"
                        >
                            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
