'use client';

import { UserProfile } from '@clerk/nextjs';
import SubscriptionCard from '@/components/SubscriptionCard';
import OrganizationManagement from '@/components/OrganizationManagement';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-3xl font-bold text-indigo-600 border-b mb-8">Account Settings</h1>

        {/* 1. CLERK USER PROFILE */}
        <div className="mb-10">
          <div className="bg-white rounded-xl shadow-xl">
            <UserProfile
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-none w-full',
                  page: 'p-4 sm:p-6 w-inherit',
                },
              }}
            />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-indigo-600 mb-6 border-b pb-2">Your VeriAct Status</h2>

        {/* 2. CUSTOM COMPONENTS */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Subscription Card */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-indigo-600 mb-4 border-b pb-2">Subscription & Billing</h3>
            <SubscriptionCard />
          </div>
          
          {/* Organization Management */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-indigo-600 mb-4 border-b pb-2">Organization Access</h3>
            <OrganizationManagement />
          </div>

        </div>
      </div>
    </div>
  );
}