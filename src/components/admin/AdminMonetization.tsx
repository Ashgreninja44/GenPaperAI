import React, { useState, useEffect } from 'react';
import { UserProfile, SubscriptionGlobalConfig } from '../../types';
import { Sparkles, Megaphone, Coins } from 'lucide-react';
import { AdminAdvertisements } from './AdminAdvertisements';
import { AdminSubscriptions } from './AdminSubscriptions';
import { subscribeToSubscriptionConfig } from '../../services/subscriptionService';

interface AdminMonetizationProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onRefreshUsers?: () => void;
}

export const AdminMonetization: React.FC<AdminMonetizationProps> = ({
  currentUser,
  users,
  onRefreshUsers
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'subscriptions' | 'advertisements'>('subscriptions');
  const [subConfig, setSubConfig] = useState<SubscriptionGlobalConfig | null>(null);

  useEffect(() => {
    const unsub = subscribeToSubscriptionConfig((cfg) => {
      setSubConfig(cfg);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-navigation Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-2xl w-fit border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveSubTab('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'subscriptions'
              ? 'bg-white dark:bg-gray-900 text-[#8A2CB0] dark:text-purple-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Subscriptions & Pricing</span>
        </button>

        <button
          onClick={() => setActiveSubTab('advertisements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'advertisements'
              ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Advertisements & AdSense</span>
        </button>
      </div>

      {/* Render Sub-Tab */}
      <div>
        {activeSubTab === 'subscriptions' ? (
          <AdminSubscriptions
            currentUser={currentUser}
            users={users}
            config={subConfig}
            onRefreshUsers={onRefreshUsers}
          />
        ) : (
          <AdminAdvertisements
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

export default AdminMonetization;
