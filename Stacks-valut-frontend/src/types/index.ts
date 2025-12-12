export interface Proposal {
  id: number;
  creator: string;
  amount: number;
  recipient: string;
  yesVotes: number;
  noVotes: number;
  endBlock: number;
  endTimestamp: number;
  executed: boolean;
  createdAt: number;
}

export interface ProposalStatus {
  status: 'voting-active' | 'passed-pending-execution' | 'rejected' | 'executed' | 'not-found';
}

export interface VotingDeadlineInfo {
  endTimestamp: number;
  createdAt: number;
  timeRemaining: number;
  isActive: boolean;
}

export interface ProposalResults {
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  winning: boolean;
}

export interface UserData {
  address: string;
  isMember: boolean;
  hasPasskey: boolean;
  balance: number;
}
