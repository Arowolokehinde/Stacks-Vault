'use client';

import { useStacksAuth } from '@/hooks/useStacksAuth';
import { FaWallet } from 'react-icons/fa';

export default function WalletConnect() {
  const { isAuthenticated, isLoading, address, connect, disconnect } = useStacksAuth();

  if (isLoading) {
    return (
      <button className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (isAuthenticated && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-purple-800 text-white rounded-lg font-mono text-sm">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
    >
      <FaWallet />
      Connect Wallet
    </button>
  );
}
