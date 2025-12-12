'use client';

import { useState } from 'react';
import { useVote } from '@/hooks/useVote';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

interface VoteButtonProps {
  proposalId: number;
}

export default function VoteButton({ proposalId }: VoteButtonProps) {
  const { vote, isSubmitting, error } = useVote();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);

  const handleVote = async (support: boolean) => {
    setSelectedVote(support);
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    if (selectedVote !== null) {
      await vote(proposalId, selectedVote);
      setShowConfirm(false);
    }
  };

  const cancelVote = () => {
    setShowConfirm(false);
    setSelectedVote(null);
  };

  if (showConfirm) {
    return (
      <div className="bg-gray-700 rounded-lg p-4 space-y-3">
        <p className="text-white text-center">
          Confirm your {selectedVote ? 'YES' : 'NO'} vote?
        </p>
        <div className="flex gap-3">
          <button
            onClick={confirmVote}
            disabled={isSubmitting}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </button>
          <button
            onClick={cancelVote}
            disabled={isSubmitting}
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => handleVote(true)}
        disabled={isSubmitting}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaThumbsUp />
        Vote Yes
      </button>
      <button
        onClick={() => handleVote(false)}
        disabled={isSubmitting}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <FaThumbsDown />
        Vote No
      </button>
    </div>
  );
}
