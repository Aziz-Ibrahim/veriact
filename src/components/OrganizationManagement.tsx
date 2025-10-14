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
  role: string;
}

export default function OrganizationManagement() {
  const { user } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrganizations();
    }
  }, [user]);

  const loadOrganizations = async () => {
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

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Organization token copied!');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Organizations List */}
      {organizations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Organizations</h3>
          <p className="text-gray-600 mb-4">
            Create an organization to enable Enterprise features for your team
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Create Organization
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">
                      {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  {org.role}
                </span>
              </div>

              {org.role === 'owner' && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Share Token</p>
                    <button
                      onClick={() => copyToken(org.token)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono bg-white px-3 py-2 rounded border border-gray-200 text-gray-700">
                    {org.token}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Share this token with team members so they can join your organization
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateOrgModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadOrganizations();
          }}
        />
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <JoinOrgModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setShowJoinModal(false);
            loadOrganizations();
          }}
        />
      )}
    </div>
  );
}

// Create Organization Modal
function CreateOrgModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName: name, domain: domain || null }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Organization created!');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to create organization');
      }
    } catch (error) {
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Create Organization</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Domain (Optional)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="company.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              If set, only users with this email domain can join
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 flex items-center space-x-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Join Organization Modal
function JoinOrgModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [token, setToken] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!token.trim()) {
      toast.error('Organization token is required');
      return;
    }

    setJoining(true);
    try {
      const res = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationToken: token }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Joined organization!');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to join organization');
      }
    } catch (error) {
      toast.error('Failed to join organization');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Join Organization</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Token *
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="ORG-XXXXXXXXXXXX"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-indigo-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ask your organization owner for the token
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 flex items-center space-x-2"
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <span>Join</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}