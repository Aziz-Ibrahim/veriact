'use client';

import { HeroBackground } from '../components/HeroBackground';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { CheckCircle2, Lock, Bell, Shield, Users, Download, Zap, Check, X, ArrowRight, Mic, Video, FileText } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function App() {
  const { isSignedIn, isLoaded } = useUser();
  
  // Button text based on auth status
  const heroCTA = isSignedIn ? 'Go to Dashboard' : 'Start Free';
  const pricingFreeCTA = isSignedIn ? 'Open Dashboard' : 'Get Started Free';
  const pricingProCTA = isSignedIn ? 'Upgrade to Pro' : 'Start Pro Trial';

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
            className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition shadow-lg font-semibold flex items-center space-x-2"
          >
            <span>{isLoaded ? (isSignedIn ? 'Dashboard' : 'Get Started Free') : 'Loading...'}</span>
            {isSignedIn && <ArrowRight className="w-4 h-4" />}
          </motion.a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />

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
              VeriAct extracts action items from your meeting transcripts and recordings using AI,
              keeps them organized, and reminds you before deadlines.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <a
                href="/dashboard"
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition text-lg shadow-lg font-semibold flex items-center justify-center space-x-2"
              >
                <span>{isLoaded ? heroCTA : 'Loading...'}</span>
                {isSignedIn && <ArrowRight className="w-5 h-5" />}
              </a>
              <a
                href="#pricing"
                className="px-8 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-lg backdrop-blur-sm border-2 border-white/30"
              >
                View Pricing
              </a>
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
                Privacy First · Recordings Auto-Deleted · GDPR Compliant
              </span>
            </motion.div>
          </div>
        </main>

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

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and privacy-focused
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"> 
            
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-indigo-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Free Plan</h3>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                  Solo Use
                </span>
              </div>
              
              <ol className="space-y-4 mb-6">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-gray-700">Upload your meeting transcript (TXT, DOCX)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-gray-700">VeriAct extracts action items with AI</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-gray-700">Data stored in your browser only</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span className="text-gray-700">Download as JSON/CSV for backup</span>
                </li>
              </ol>

              <div className="bg-white p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Zero Data Storage</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your meeting transcripts are never stored on our servers. Everything stays in your browser.
                </p>
              </div>
            </motion.div>

            {/* Pro Plan Card (Collaboration) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl border-2 border-purple-300 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-full">
                  POPULAR
                </span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Pro Plan</h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                  Team Collaboration
                </span>
              </div>
              
              <ol className="space-y-4 mb-6">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-gray-700">Upload meeting transcript</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-gray-700">AI extracts action items</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-gray-700"><strong>Create a room</strong> and invite team members</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span className="text-gray-700">Everyone gets email reminders & can track progress</span>
                </li>
              </ol>

              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">Secure Collaboration</span>
                </div>
                <p className="text-sm text-gray-600">
                  Action items stored securely for 90 days. Only invited members can access. Transcripts are still never stored.
                </p>
              </div>
            </motion.div>

            {/* Enterprise Plan Card (Automation) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-50 to-gray-200 p-8 rounded-2xl border-2 border-yellow-400 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-bold rounded-full">
                  AUTOMATION
                </span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Enterprise Plan</h3>
                <span className="px-3 py-1 bg-yellow-100 text-gray-900 text-sm font-semibold rounded-full">
                  Meeting Bot
                </span>
              </div>
              
              <ol className="space-y-4 mb-6">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-gray-700">Invite VeriAct Bot to Zoom/Meet</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-gray-700">Bot joins, records, and transcribes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-gray-700">AI instantly extracts action items</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span className="text-gray-700">Room created automatically – **No manual uploads**</span>
                </li>
              </ol>

              <div className="bg-white p-4 rounded-lg border border-yellow-300">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Full Automation</span>
                </div>
                <p className="text-sm text-gray-600">
                  Transcripts are processed in real-time, then discarded. Action items are saved securely for your team.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to stay on top of action items</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-600">AI-Powered Extraction</h3>
              <p className="text-gray-600">
                Automatically identifies action items, assignees, and deadlines from your meeting transcripts and recordings.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-purple-600">Audio & Video Upload</h3>
              <p className="text-gray-600">
                Upload meeting recordings (MP4, MP3, WAV) and let AI auto-transcribe and extract action items. Pro feature.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-600">Team Collaboration</h3>
              <p className="text-gray-600">
                Create rooms, invite members, and track action items together. Everyone stays in sync with real-time updates.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-600">Smart Reminders</h3>
              <p className="text-gray-600">
                Get notified before deadlines via email. Never miss an important task again with automated reminders.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-600">Privacy First</h3>
              <p className="text-gray-600">
                Recordings auto-deleted after processing. Only action items are saved if you choose to collaborate.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-600">Export Anywhere</h3>
              <p className="text-gray-600">
                Download your action items as JSON or CSV to use with other tools, or add deadlines to your calendar.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section - UPDATED */}
      <section id="pricing" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that works for you</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-xl transition"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">£0</span>
                <span className="text-gray-600">/forever</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">5 extractions per month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Upload transcripts (TXT, DOCX)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">AI action item extraction</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Browser storage only</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Export to JSON/CSV</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Join rooms as guest</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">No audio/video upload</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">No room creation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">No email reminders</span>
                </li>
              </ul>

              <a
                href="/dashboard"
                className="block w-full py-3 px-6 text-center bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center space-x-2"
              >
                <span>{isLoaded ? pricingFreeCTA : 'Loading...'}</span>
                {isSignedIn && <ArrowRight className="w-4 h-4" />}
              </a>
            </motion.div>

            {/* Pro Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-8 hover:shadow-2xl transition relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">£12</span>
                <span className="text-indigo-200">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Unlimited extractions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Upload transcripts (TXT, DOCX, PDF)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Mic className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Upload recordings</strong> (MP4, MP3, WAV)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Video className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Auto-transcription</strong> with AI</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Create unlimited rooms</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Invite team members</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Email reminders</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span>Real-time status tracking</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">No meeting bot</span>
                </li>
              </ul>

              <a
                href="/dashboard"
                className="block w-full py-3 px-6 text-center bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center space-x-2"
              >
                <span>{isLoaded ? pricingProCTA : 'Loading...'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Enterprise Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 hover:shadow-2xl transition relative border-2 border-yellow-400"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  ENTERPRISE
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">£49</span>
                <span className="text-gray-400">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Everything in Pro</strong></span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-yellow-400">VeriAct Meeting Bot</strong></span>
                </li>
                <li className="flex items-start space-x-3 ml-8">
                  <span className="text-sm text-gray-300">• Joins Zoom/Google Meet automatically</span>
                </li>
                <li className="flex items-start space-x-3 ml-8">
                  <span className="text-sm text-gray-300">• Records & transcribes in real-time</span>
                </li>
                <li className="flex items-start space-x-3 ml-8">
                  <span className="text-sm text-gray-300">• Auto-creates room with action items</span>
                </li>
                <li className="flex items-start space-x-3 ml-8">
                  <span className="text-sm text-gray-300">• No manual uploads needed</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Organization management</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Custom integrations</span>
                </li>
              </ul>

              <a
                href="/dashboard"
                className="block w-full py-3 px-6 text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition font-bold flex items-center justify-center space-x-2"
              >
                <span>{isSignedIn ? 'Upgrade to Enterprise' : 'Start Enterprise Trial'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* Pro vs Enterprise Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Pro vs Enterprise: What's the Difference?</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-purple-900 font-semibold mb-2">✨ Pro Plan (£12/mo)</p>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Upload meeting recordings manually</li>
                        <li>• AI auto-transcribes in 5-10 minutes</li>
                        <li>• Great for individuals & small teams</li>
                        <li>• File size limit: 500MB per upload</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-yellow-700 font-semibold mb-2">Enterprise (£49/mo)</p>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Bot auto-joins meetings (no uploads!)</li>
                        <li>• Real-time transcription & extraction</li>
                        <li>• Perfect for organizations</li>
                        <li>• Unlimited file sizes & priority processing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-50 to-indigo-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          < Footer />
        </div>
      </footer>
    </div>
  );
}