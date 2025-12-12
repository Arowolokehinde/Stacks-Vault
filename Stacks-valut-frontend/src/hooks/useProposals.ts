'use client';

import useSWR from 'swr';
import { getProposal, getProposalStatus } from '@/lib/stacks';
import type { Proposal, ProposalStatus } from '@/types';

export function useProposal(proposalId: number) {
  const { data: proposal, error, mutate } = useSWR<Proposal>(
    proposalId ? `proposal-${proposalId}` : null,
    () => getProposal(proposalId)
  );

  const { data: status } = useSWR<ProposalStatus>(
    proposalId ? `proposal-status-${proposalId}` : null,
    () => getProposalStatus(proposalId)
  );

  return {
    proposal,
    status,
    isLoading: !error && !proposal,
    isError: error,
    mutate,
  };
}

export function useProposals(count: number = 10) {
  const proposalIds = Array.from({ length: count }, (_, i) => i + 1);

  const proposals = proposalIds.map((id) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useSWR(`proposal-${id}`, () => getProposal(id));
    return data;
  }).filter(Boolean);

  return {
    proposals,
    isLoading: proposals.length === 0,
  };
}
