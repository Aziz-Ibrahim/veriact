'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react'; // simple SVG icon

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-white shadow-lg rounded-xl p-5 md:max-w-md border border-gray-200 z-50 flex flex-col md:flex-row md:items-center md:gap-4"
    >
      <div className="flex items-center gap-3 mb-3 md:mb-0">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="bg-amber-100 p-2 rounded-full"
        >
          <Cookie className="w-6 h-6 text-amber-600" />
        </motion.div>

        <div>
          <p className="text-sm text-gray-800 font-medium">We use cookies 🍪</p>
          <p className="text-xs text-gray-600">
            We use essential cookies to make VeriAct work, and optional cookies to improve your experience. See our{' '}
            <a href="/cookies" className="text-indigo-600 underline hover:text-indigo-700">
              Cookie Policy
            </a>.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 md:ml-auto">
        <button
          onClick={() => handleConsent(false)}
          className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          Reject
        </button>
        <button
          onClick={() => handleConsent(true)}
          className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Accept
        </button>
      </div>
    </motion.div>
  );
}
