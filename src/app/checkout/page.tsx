'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, CheckCircle, Crown, Rocket, ArrowLeft, Users, Plus } from 'lucide-react'; 
import toast from 'react-hot-toast';

// Define the organization type
interface Organization {
  id: string;
  name: string;
  role: string;
}

// Inline Organization Creation Component
interface CreateOrganizationFormProps {
    onCreateSuccess: (orgId: string) => void;
}

function CreateOrganizationForm({ onCreateSuccess }: CreateOrganizationFormProps) {
    const [orgName, setOrgName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!orgName.trim()) {
            toast.error('Please enter an organization name.');
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch('/api/organizations/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizationName: orgName }),
            });
            const data = await res.json();

            if (data.success && data.organization?.id) {
                toast.success('Organization created! You can now proceed to payment.');
                onCreateSuccess(data.organization.id);
            } else {
                toast.error(data.error || 'Failed to create organization. Please try again.');
            }
        } catch (error) {
            toast.error('Network error during organization creation.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-4">
            <p className='text-sm text-gray-700 font-medium'>
                Before subscribing to Enterprise, you must create your primary organization.
            </p>
            <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                </label>
                <input
                    id="org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g., VeriAct Solutions Ltd."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-700"
                />
            </div>
            <button
                onClick={handleCreate}
                disabled={isCreating || !orgName.trim()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
            >
                {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Plus className="w-4 h-4" />
                )}
                <span>{isCreating ? 'Creating...' : 'Create Organization & Continue'}</span>
            </button>
        </div>
    );
}


function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname(); 
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<'pro' | 'enterprise' | null>(null);
  
  const [ownedOrganizations, setOwnedOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  useEffect(() => {
    const planParam = searchParams.get('plan') as 'pro' | 'enterprise';
    if (planParam && ['pro', 'enterprise'].includes(planParam)) {
      setPlan(planParam);
    } else {
      toast.error('Invalid plan selected');
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');

    if (success === 'true') {
      toast.success('Subscription activated! 🎉');
      router.replace(pathname); 
      setTimeout(() => router.push('/dashboard'), 2000);
    } else if (cancelled === 'true') {
      toast.error('Checkout cancelled');
      router.replace(pathname); 
    }
  }, [searchParams, router, pathname]);


  useEffect(() => {
    // Only load organizations if the user is checking out for Enterprise
    if (user && plan === 'enterprise' && isLoaded) {
        loadOwnedOrganizations();
    }
  }, [user, plan, isLoaded]);

  const loadOwnedOrganizations = async () => {
    setLoadingOrgs(true);
    try {
        const res = await fetch('/api/organizations/list'); 
        const data = await res.json();
        
        if (data.organizations) {
            // Filter to only include organizations where the user is the owner
            const owned = data.organizations.filter((org: Organization) => org.role === 'owner');
            setOwnedOrganizations(owned);
            if (owned.length === 1) {
                setSelectedOrganizationId(owned[0].id);
            }
        }
    } catch (error) {
        console.error('Failed to load owned organizations:', error);
        toast.error('Failed to load your organizations.');
    } finally {
        setLoadingOrgs(false);
    }
  };

  const handleOrganizationCreated = (orgId: string) => {
      setSelectedOrganizationId(orgId); 
      setOwnedOrganizations(prev => [...prev, { id: orgId, name: 'Newly Created', role: 'owner' }]);
  }

  const handleCheckout = async () => {
    if (!user || !plan) return;

    if (plan === 'enterprise' && !selectedOrganizationId) {
        toast.error('Please create or select an organization to proceed.');
        return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            plan,
            organizationId: plan === 'enterprise' ? selectedOrganizationId : undefined,
        }),
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

  const isCheckoutDisabled = plan === 'enterprise' && !selectedOrganizationId;

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

            {/* --- ENTERPRISE SELECTION/CREATION BLOCK --- */}
            {plan === 'enterprise' && (
                <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2 border-b pb-2 text-lg">
                        <Users className="w-5 h-5 text-yellow-700" />
                        <span>Team Setup: Organization Required</span>
                    </h3>
                    
                    {loadingOrgs ? (
                        <div className="flex items-center space-x-2 text-yellow-700 justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Loading existing organizations...</span>
                        </div>
                    ) : ownedOrganizations.length > 0 ? (
                        // CASE 1: Organizations EXIST - User must select one
                        <>
                            <p className='text-sm text-gray-700 mb-2'>
                                Select the organization you own to apply the Enterprise subscription to.
                            </p>
                            <label htmlFor="org-select" className="sr-only">
                                Select Organization to Subscribe
                            </label>
                            <select
                                id="org-select"
                                value={selectedOrganizationId || ''}
                                onChange={(e) => setSelectedOrganizationId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-700"
                            >
                                <option value="" disabled>Select an Organization</option>
                                {ownedOrganizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                            {selectedOrganizationId && (
                                <p className="text-xs text-green-700 mt-2 flex items-center space-x-1">
                                    <CheckCircle className='w-4 h-4'/> <span>Ready to proceed!</span>
                                </p>
                            )}
                        </>
                    ) : (
                        // CASE 2: NO Organizations EXIST - User must create one
                        <CreateOrganizationForm onCreateSuccess={handleOrganizationCreated} />
                    )}
                </div>
            )}

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
              disabled={loading || isCheckoutDisabled}
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
                Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm mb-1">What payment methods do you accept?</p>
              <p className="text-sm text-gray-600">
                We accept all major credit and debit cards via Stripe&apos;s secure payment processing.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm mb-1">Is there a refund policy?</p>
              <p className="text-sm text-gray-600">
                We offer a 14-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund.
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