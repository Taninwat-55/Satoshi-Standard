import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiTrash2, FiAlertTriangle, FiZap } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';
import { useSavedItems } from '../../hooks/useSavedItems';
import { useCurrencyPreference } from '../../contexts/CurrencyPreferenceContext';
import { useAiChat } from '../../hooks/useAiChat';

const SUGGESTED_QUESTIONS = [
  "What's my portfolio worth right now?",
  "How am I doing on DCA?",
  "Should I transact now given fees?",
  "What's my most expensive item in sats?",
  "How long have I been stacking?",
];

function getErrorMessage(err) {
  if (!err) return null;
  if (err === 'GROQ_API_KEY_MISSING') return 'AI assistant not configured. Add VITE_GROQ_API_KEY to your .env file.';
  if (err.includes('401')) return 'Invalid API key — check VITE_GROQ_API_KEY.';
  if (err.includes('429')) return 'Rate limit hit — wait a moment and try again.';
  return 'Connection error. Check your internet and try again.';
}

function formatMessageContent(content) {
  if (!content) return null;
  return content.split('\n').map((line, i) => {
    const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const isBullet = /^[•\-\*]\s/.test(line);
    if (isBullet) {
      return (
        <span key={i} className="block pl-4 relative before:content-['▸'] before:absolute before:left-0 before:text-brand-orange before:text-xs before:top-[3px]"
          dangerouslySetInnerHTML={{ __html: html.replace(/^[•\-\*]\s/, '') }}
        />
      );
    }
    return (
      <span key={i} className="block" dangerouslySetInnerHTML={{ __html: html }} />
    );
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0 mt-0.5">
        <FaBitcoin className="text-brand-orange text-xs" />
      </div>
      <div className="bg-neutral-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isLastAssistant, isStreaming }) {
  const isUser = message.role === 'user';
  const showCursor = isLastAssistant && isStreaming && message.content;

  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0 mt-0.5">
          <FaBitcoin className="text-brand-orange text-xs" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed space-y-0.5
        ${isUser
          ? 'bg-brand-orange text-white rounded-tr-sm'
          : 'bg-neutral-800/80 text-neutral-200 rounded-tl-sm border border-white/5'
        }`}
      >
        {formatMessageContent(message.content)}
        {showCursor && (
          <span className="inline-block w-1.5 h-3.5 bg-brand-orange ml-0.5 animate-pulse align-middle rounded-sm" />
        )}
      </div>
    </div>
  );
}

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { items, btcPrices } = useSavedItems();
  const { preferredCurrency } = useCurrencyPreference();
  const { messages, isLoading, isStreaming, error, sendMessage, clearMessages } = useAiChat();

  const chatContext = { items, btcPrices, preferredCurrency };

  useEffect(() => {
    document.body.classList.toggle('ai-chat-open', isOpen);
    return () => document.body.classList.remove('ai-chat-open');
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasBeenOpened(true);
  };

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    setInputValue('');
    sendMessage(trimmed, chatContext);
  }, [inputValue, isLoading, sendMessage, chatContext]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (q) => {
    sendMessage(q, chatContext);
  };

  const lastAssistantIndex = messages.map(m => m.role).lastIndexOf('assistant');

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-brand-orange to-brand-orange-dark text-white rounded-full shadow-lg shadow-orange-500/30 hover:scale-110 hover:shadow-orange-500/50 transition-all flex items-center justify-center group"
        title="AI Bitcoin Analyst"
        aria-label="Open AI chat"
      >
        {!hasBeenOpened && (
          <span className="absolute inset-0 rounded-full bg-brand-orange animate-ping opacity-40" />
        )}
        <FiMessageSquare className="text-xl" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 md:hidden [z-index:44]"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full md:w-[400px] [z-index:45] bg-neutral-950 border-l border-white/10 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center shadow-md shadow-orange-500/20">
                    <FaBitcoin className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">Satoshi AI</p>
                    <p className="text-[10px] text-neutral-500 leading-none mt-0.5">llama-3.3-70b · Groq</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearMessages}
                    className="btn-icon"
                    title="Clear conversation"
                  >
                    <FiTrash2 size={14} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-icon"
                    aria-label="Close chat"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden shrink-0"
                  >
                    <div className="flex items-start gap-2 px-4 py-3 bg-red-900/20 border-b border-red-900/30 text-red-400 text-xs">
                      <FiAlertTriangle className="shrink-0 mt-0.5" size={13} />
                      <span>{getErrorMessage(error)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center pt-6 pb-2">
                    <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-3">
                      <FiZap className="text-brand-orange text-xl" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">Ask me anything</p>
                    <p className="text-xs text-neutral-500 text-center mb-6 max-w-[260px]">
                      I know your portfolio, the current BTC price, and live mempool fees.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SUGGESTED_QUESTIONS.map(q => (
                        <button
                          key={q}
                          onClick={() => handleSuggestedQuestion(q)}
                          disabled={isLoading}
                          className="text-xs px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-white/10 hover:border-brand-orange/40 text-neutral-300 hover:text-white transition-all disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLastAssistant={i === lastAssistantIndex}
                    isStreaming={isStreaming}
                  />
                ))}

                {isLoading && !isStreaming && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your portfolio..."
                    disabled={isLoading}
                    className="flex-1 glass-input px-3 py-2 text-sm resize-none min-h-[40px] max-h-32 overflow-y-auto"
                    style={{ fieldSizing: 'content' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="btn-primary w-auto px-3 py-2 rounded-xl shrink-0"
                    aria-label="Send message"
                  >
                    <FiSend size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-neutral-700 mt-2 text-center">
                  Powered by Groq · Free tier · No data stored server-side
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
