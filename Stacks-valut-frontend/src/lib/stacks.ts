import { StacksTestnet, StacksMainnet } from '@stacks/network';
import {
  callReadOnlyFunction,
  cvToValue,
  uintCV,
  principalCV,
  bufferCV,
  listCV,
  boolCV,
} from '@stacks/transactions';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'Stacks-Money';
const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';

export const network = IS_MAINNET ? new StacksMainnet() : new StacksTestnet();

export const contractPrincipal = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

// Read-only function calls
export async function isMember(userAddress: string): Promise<boolean> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-member',
      functionArgs: [principalCV(userAddress)],
      network,
      senderAddress: userAddress,
    });
    return cvToValue(result) as boolean;
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
}

export async function getProposal(proposalId: number) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-proposal',
      functionArgs: [uintCV(proposalId)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return null;
  }
}

export async function getProposalStatus(proposalId: number) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-proposal-status',
      functionArgs: [uintCV(proposalId)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching proposal status:', error);
    return null;
  }
}

export async function getVotingDeadlineInfo(proposalId: number) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-voting-deadline-info',
      functionArgs: [uintCV(proposalId)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching voting deadline:', error);
    return null;
  }
}

export async function getProposalResults(proposalId: number) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-proposal-results',
      functionArgs: [uintCV(proposalId)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching proposal results:', error);
    return null;
  }
}

export async function getTreasuryBalance(userAddress: string) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-treasury-balance',
      functionArgs: [],
      network,
      senderAddress: userAddress,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    return 0;
  }
}

export async function hasVoted(proposalId: number, voterAddress: string) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'has-voted',
      functionArgs: [uintCV(proposalId), principalCV(voterAddress)],
      network,
      senderAddress: voterAddress,
    });
    return cvToValue(result) as boolean;
  } catch (error) {
    console.error('Error checking vote status:', error);
    return false;
  }
}

export async function hasPasskey(memberAddress: string) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'has-passkey',
      functionArgs: [principalCV(memberAddress)],
      network,
      senderAddress: memberAddress,
    });
    return cvToValue(result) as boolean;
  } catch (error) {
    console.error('Error checking passkey:', error);
    return false;
  }
}

export async function getDelegation(delegatorAddress: string, proposalId: number) {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-delegation',
      functionArgs: [principalCV(delegatorAddress), uintCV(proposalId)],
      network,
      senderAddress: delegatorAddress,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching delegation:', error);
    return null;
  }
}

export async function getActiveProposalsInfo() {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-active-proposals-info',
      functionArgs: [],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToValue(result);
  } catch (error) {
    console.error('Error fetching active proposals info:', error);
    return null;
  }
}
