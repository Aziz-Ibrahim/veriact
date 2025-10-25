'use client';

import { X, Crown, Users, Bell, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'rooms' | 'invites' | 'reminders' | 'bot';
  currentPlan: 'free' | 'pro' | 'enterprise';
}

export default function UpgradePrompt({ isOpen, onClose, feature, currentPlan }: UpgradePromptProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const featureDetails = {
    rooms: {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: 'Team Collaboration',
      description: 'Create shared rooms to track action items with your team in real-time.',
      features: [
        'Unlimited collaboration rooms',
        'Invite unlimited team members',
        'Real-time status updates',
        'Email reminders for deadlines',
        '90-day room retention',
        'Export and share capabilities',
      ],
    },
    invites: {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: 'Team Invitations',
      description: 'Invite team members to collaborate on action items and track progress together.',
      features: [
        'Invite via email',
        'Role-based access (viewer/editor)',
        'Automatic email notifications',
        'Team member management',
        'Collaborative status tracking',
      ],
    },
    reminders: {
      icon: <Bell className="w-12 h-12 text-purple-600" />,
      title: 'Email Reminders',
      description: 'Never miss a deadline with automated email reminders for pending action items.',
      features: [
        'Daily email reminders',
        'Deadline notifications',
        'Progress tracking emails',
        'Customizable reminder settings',
        'Team-wide notifications',
      ],
    },
    bot: {
      icon: <Sparkles className="w-12 h-12 text-yellow-600" />,
      title: 'Meeting Bot',
      description: 'Automatically join meetings, transcribe, and extract action items—no manual work needed.',
      features: [
        'Auto-join Zoom/Google Meet',
        'Real-time transcription',
        'Automatic action item extraction',
        'Instant room creation',
        'Organization-wide access',
        'Priority support',
      ],
    },
  };

  const detail = featureDetails[feature];
  const targetPlan = feature === 'bot' ? 'enterprise' : 'pro';
  const planPrice = targetPlan === 'enterprise' ? '£49' : '£9';

  const handleUpgrade = () => {
    router.push(`/checkout?plan=${targetPlan}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {detail.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{detail.title}</h2>
              <p className="text-purple-100 text-sm">Upgrade to unlock this feature</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Description */}
          <p className="text-lg text-gray-700 mb-6">
            {detail.description}
          </p>

          {/* Current Plan Badge */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Current Plan</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{currentPlan}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Upgrade to</p>
                <p className="text-xl font-bold text-purple-600 capitalize">{targetPlan}</p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <span>What you'll get with {targetPlan === 'enterprise' ? 'Enterprise' : 'Pro'}:</span>
            </h3>
            <ul className="space-y-3">
              {detail.features.map((feat, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Starting at</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{planPrice}</span>
                  <span className="text-xl text-gray-600 ml-2">/month</span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Cancel anytime
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              14-day money-back guarantee • No commitment • Full access immediately
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-semibold text-lg shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Upgrade to {targetPlan === 'enterprise' ? 'Enterprise' : 'Pro'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">100+</p>
                <p className="text-xs text-gray-600">Active Teams</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">10k+</p>
                <p className="text-xs text-gray-600">Action Items Tracked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">99%</p>
                <p className="text-xs text-gray-600">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}