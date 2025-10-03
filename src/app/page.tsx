'use client';

import { HeroBackground } from '../components/HeroBackground';
import { motion } from 'motion/react';
import { CheckCircle2, Lock, Bell, Shield } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="font-bold text-xl text-indigo-600">V</span>
            </div>
            <span className="text-2xl text-white">VeriAct</span>
          </motion.div>
          <motion.a
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            href="/dashboard"
            className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition shadow-lg"
          >
            Get Started
          </motion.a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Effects */}
        <HeroBackground />

        {/* Hero Content */}
        <main className="relative z-10 container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl text-white mb-6"
            >
              Never Lose Track of <br/>
              <span className="bg-gradient-to-r from-blue-200 via-indigo-700 to-purple-500 bg-clip-text text-transparent">
                Action Items
              </span>
              <br/> Again
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              VeriAct extracts action items from your meeting transcripts using AI,
              keeps them organized, and reminds you before deadlines.<br/>
              <span className="font-semibold text-blue-200">Your data stays yours.</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <a
                href="/dashboard"
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition text-lg shadow-lg"
              >
                Start Extracting Actions
              </a>
              <button className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-lg backdrop-blur-sm border-2 border-white/30">
                Watch Demo
              </button>
            </motion.div>

            {/* Privacy Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20"
            >
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-white">
                GDPR Compliant · Zero Data Storage · Privacy First
              </span>
            </motion.div>
          </div>
        </main>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-white rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="mb-2 text-indigo-600">AI-Powered Extraction</h3>
              <p className="text-gray-600">
                Automatically identifies action items, assignees, and deadlines from your meeting transcripts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-green-600">Your Storage, Your Control</h3>
              <p className="text-gray-600">
                Data is saved to your own Google Drive, Dropbox, or local storage. We never store your meetings.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-purple-600">Smart Reminders</h3>
              <p className="text-gray-600">
                Get notified before deadlines so nothing falls through the cracks.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-50 to-indigo-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">
            Built with privacy in mind · VeriAct © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
