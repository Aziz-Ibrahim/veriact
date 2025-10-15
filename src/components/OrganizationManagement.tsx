'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Building2, Users, Copy, CheckCircle, Plus, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  token: string;
  memberCount: number;
  role: 'owner' | 'member';
}


export default function OrganizationManagement() {
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // State to hold the user's current subscription plan
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro' | 'enterprise'>('free'); 

  useEffect(() => {
    if (user) {
      loadOrganizations();
      checkSubscriptionStatus(); 
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
      try {
        // Fetch the user's active plan
        const res = await fetch('/api/subscription/status');
        const data = await res.json();
        
        const status = data.status as 'free' | 'pro' | 'enterprise';
        setSubscriptionPlan(status);
        
      } catch (error) {
        // Default to free if API fails
        setSubscriptionPlan('free');
      }
  };

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organizations/list');
      const data = await res.json();
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logic to determine if the user is eligible to CREATE an organization
  const canCreateOrganization = subscriptionPlan === 'enterprise';

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Organization token copied!');
  };
  
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    toast.success('Organization created successfully!');
    loadOrganizations();
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    toast.success('Successfully joined organization!');
    loadOrganizations();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-3">
        
        {/* --- CONDITIONAL RENDERING: Only show Create button if user is Enterprise --- */}
        {canCreateOrganization && (
            <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
                <Plus className="w-4 h-4" />
                <span>Create Organization</span>
            </button>
        )}

        {/* JOIN ORGANIZATION BUTTON (Available to all plans) */}
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Join Organization</span>
        </button>
      </div>

      {/* Organization List */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Organizations ({organizations.length})</h3>
        {loading ? (
            <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
            </div>
        ) : organizations.length === 0 ? (
            <p className="text-sm text-gray-600">
                You are not currently part of any organization. You can join one using a token, or {
                  canCreateOrganization ? 'create a new one using the button above.' : 'upgrade to Enterprise to create your own.'
                }
            </p>
        ) : (
            <div className="space-y-3">
                {organizations.map((org) => (
                    <div key={org.id} className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            <div>
                                <p className="font-medium text-gray-900">{org.name}</p>
                                <p className="text-xs text-gray-500">{org.role === 'owner' ? 'Owner' : 'Member'} • {org.memberCount} Members</p>
                            </div>
                        </div>
                        {org.role === 'owner' && (
                            <button
                                onClick={() => copyToken(org.token)}
                                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-50 border border-gray-200 text-indigo-600 rounded-md hover:bg-gray-100 transition"
                                title="Copy Organization Token"
                            >
                                <Copy className="w-4 h-4" />
                                <span>Token</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Placeholder Modals */}
      {/* {showCreateModal && <CreateOrganizationModal isOpen={true} onClose={() => setShowCreateModal(false)} onCreateSuccess={handleCreateSuccess} />} */}
      {/* {showJoinModal && <JoinOrganizationModal isOpen={true} onClose={() => setShowJoinModal(false)} onJoinSuccess={handleJoinSuccess} />} */}
    </div>
  );
}