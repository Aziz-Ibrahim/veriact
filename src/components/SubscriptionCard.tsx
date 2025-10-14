'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Crown, Zap, Rocket, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'enterprise';
  status: string;
  isActive: boolean;
  organizationId?: string;
  organizationName?: string;
}

export default function SubscriptionCard() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const res = await fetch('/api/subscription/status');
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan,
          organizationId: subscription?.organizationId 
        }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Failed to upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!subscription) return null;

  const getPlanIcon = () => {
    switch (subscription.plan) {
      case 'enterprise':
        return <Rocket className="w-6 h-6 text-yellow-600" />;
      case 'pro':
        return <Crown className="w-6 h-6 text-purple-600" />;
      default:
        return <Zap className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPlanColor = () => {
    switch (subscription.plan) {
      case 'enterprise':
        return 'from-yellow-500 to-orange-500';
      case 'pro':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor()} rounded-xl flex items-center justify-center`}>
            {getPlanIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {subscription.plan} Plan
            </h3>
            {subscription.organizationName && (
              <p className="text-sm text-gray-500">{subscription.organizationName}</p>
            )}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          subscription.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {subscription.status}
        </span>
      </div>

      {/* Current Plan Features */}
      <div className="space-y-2 mb-6">
        {subscription.plan === 'free' && (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>5 extractions per month</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>No collaboration features</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4" />
              <span>No email reminders</span>
            </div>
          </>
        )}

        {subscription.plan === 'pro' && (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Unlimited extractions</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Unlimited collaboration rooms</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Email reminders</span>
            </div>
          </>
        )}

        {subscription.plan === 'enterprise' && (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Everything in Pro</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-yellow-600" />
              <span>VeriAct Meeting Bot</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-yellow-600" />
              <span>Priority support</span>
            </div>
          </>
        )}
      </div>

      {/* Upgrade Buttons */}
      {subscription.plan === 'free' && (
        <div className="space-y-2">
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={upgrading}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {upgrading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro - £9/month</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleUpgrade('enterprise')}
            disabled={upgrading}
            className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Rocket className="w-4 h-4" />
            <span>Upgrade to Enterprise - £49/month</span>
          </button>
        </div>
      )}

      {subscription.plan === 'pro' && (
        <button
          onClick={() => handleUpgrade('enterprise')}
          disabled={upgrading}
          className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {upgrading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Upgrade to Enterprise - £49/month</span>
            </>
          )}
        </button>
      )}

      {subscription.plan === 'enterprise' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 text-center">
            🎉 You're on the highest plan!
          </p>
        </div>
      )}
    </div>
  );
}