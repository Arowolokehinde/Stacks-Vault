'use client';

import { Proposal, ProposalStatus } from '@/types';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import VoteButton from './VoteButton';

interface ProposalCardProps {
  proposal: Proposal;
  status?: ProposalStatus;
  userAddress?: string;
}

export default function ProposalCard({ proposal, status, userAddress }: ProposalCardProps) {
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;

  const getStatusBadge = () => {
    if (proposal.executed) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm">
          <FaCheckCircle /> Executed
        </span>
      );
    }
    if (status?.active) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
          <FaClock /> Active
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
        <FaTimesCircle /> Ended
      </span>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white">Proposal #{proposal.id}</h3>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-gray-400 text-sm">Recipient</p>
          <p className="text-white font-mono text-sm break-all">{proposal.recipient}</p>
        </div>

        <div>
          <p className="text-gray-400 text-sm">Amount</p>
          <p className="text-white text-lg font-semibold">{proposal.amount} sBTC</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Created</p>
            <p className="text-white text-sm">{formatDate(proposal.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Ends</p>
            <p className="text-white text-sm">{formatDate(proposal.endTimestamp)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-green-400">Yes: {proposal.yesVotes}</span>
          <span className="text-red-400">No: {proposal.noVotes}</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div className="flex h-full">
            <div
              className="bg-green-500"
              style={{ width: `${yesPercentage}%` }}
            />
            <div
              className="bg-red-500"
              style={{ width: `${noPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {userAddress && status?.active && !status?.hasVoted && (
        <VoteButton proposalId={proposal.id} />
      )}

      {status?.hasVoted && (
        <p className="text-center text-gray-400 text-sm">You have already voted</p>
      )}
    </div>
  );
}
