'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, CheckCircle, Crown, Rocket, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<'pro' | 'enterprise' | null>(null);

  useEffect(() => {
    const planParam = searchParams.get('plan') as 'pro' | 'enterprise';
    if (planParam && ['pro', 'enterprise'].includes(planParam)) {
      setPlan(planParam);
    } else {
      toast.error('Invalid plan selected');
      router.push('/dashboard');
    }
  }, [searchParams]);

  useEffect(() => {
    // Check for success/cancelled params
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');

    if (success === 'true') {
      toast.success('Subscription activated! 🎉');
      setTimeout(() => router.push('/dashboard'), 2000);
    } else if (cancelled === 'true') {
      toast.error('Checkout cancelled');
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    if (!user || !plan) return;

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to start checkout');
      setLoading(false);
    }
  };

  if (!isLoaded || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const planDetails = plan === 'pro' ? {
    name: 'Pro',
    price: '£9',
    icon: <Crown className="w-12 h-12 text-purple-600" />,
    gradient: 'from-purple-500 to-indigo-600',
    features: [
      'Unlimited extractions',
      'Unlimited collaboration rooms',
      'Invite team members',
      'Email reminders',
      'Real-time status tracking',
      'Export to JSON/CSV',
      'Priority email support',
    ],
  } : {
    name: 'Enterprise',
    price: '£49',
    icon: <Rocket className="w-12 h-12 text-yellow-600" />,
    gradient: 'from-yellow-500 to-orange-500',
    features: [
      'Everything in Pro',
      'VeriAct Meeting Bot',
      'Auto-join Zoom/Google Meet',
      'Real-time transcription',
      'Auto-create rooms',
      'Organization management',
      'Team tokens',
      'Priority support & custom integrations',
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Checkout Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${planDetails.gradient} p-8 text-center`}>
            <div className="flex justify-center mb-4">
              {planDetails.icon}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Upgrade to {planDetails.name}
            </h1>
            <p className="text-white/90">
              Get access to all premium features
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center mb-2">
                <span className="text-5xl font-bold text-gray-900">{planDetails.price}</span>
                <span className="text-xl text-gray-600 ml-2">/month</span>
              </div>
              <p className="text-sm text-gray-600">Cancel anytime, no commitment</p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What's included:</h3>
              <ul className="space-y-3">
                {planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Secure Payment by Stripe</p>
                  <p>Your payment information is processed securely. We never store your card details.</p>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r ${planDetails.gradient} text-white rounded-lg hover:opacity-90 transition font-bold text-lg disabled:opacity-50 flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Continue to Payment</span>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900 text-sm mb-1">Can I cancel anytime?</p>
              <p className="text-sm text-gray-600">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm mb-1">What payment methods do you accept?</p>
              <p className="text-sm text-gray-600">
                We accept all major credit and debit cards via Stripe's secure payment processing.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm mb-1">Is there a refund policy?</p>
              <p className="text-sm text-gray-600">
                We offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}