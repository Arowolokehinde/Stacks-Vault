'use client';

import { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, boolCV, listCV, principalCV, bufferCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet();
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'Stacks-Money';

export function useVote() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = async (proposalId: number, support: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'vote',
        functionArgs: [uintCV(proposalId), boolCV(support)],
        onFinish: (data) => {
          console.log('Vote submitted:', data);
          setIsSubmitting(false);
        },
        onCancel: () => {
          setIsSubmitting(false);
          setError('Transaction was cancelled');
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  const batchVote = async (proposalIds: number[], votes: boolean[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'batch-vote',
        functionArgs: [
          listCV(proposalIds.map(id => uintCV(id))),
          listCV(votes.map(v => boolCV(v)))
        ],
        onFinish: (data) => {
          console.log('Batch vote submitted:', data);
          setIsSubmitting(false);
        },
        onCancel: () => {
          setIsSubmitting(false);
          setError('Transaction was cancelled');
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to submit batch vote');
    }
  };

  const delegateVote = async (
    proposalId: number,
    delegateTo: string,
    publicKey: Buffer,
    messageHash: Buffer,
    signature: Buffer
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'delegate-vote-with-passkey',
        functionArgs: [
          uintCV(proposalId),
          principalCV(delegateTo),
          bufferCV(publicKey),
          bufferCV(messageHash),
          bufferCV(signature)
        ],
        onFinish: (data) => {
          console.log('Vote delegated:', data);
          setIsSubmitting(false);
        },
        onCancel: () => {
          setIsSubmitting(false);
          setError('Transaction was cancelled');
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to delegate vote');
    }
  };

  return {
    vote,
    batchVote,
    delegateVote,
    isSubmitting,
    error,
  };
}
