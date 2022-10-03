import { BigNumber } from '@ethersproject/bignumber'
import { getLyraContract, getLyraContractAddress, LyraContractId } from '@lyrafinance/lyra-js'
import { hexlify } from 'ethers/lib/utils'
import { useCallback } from 'react'

import { Network } from '@/app/constants/networks'
import getLyraMarketContractFromAddress from '@/app/utils/getLyraMarketContractFromAddress'
import getMultiSigWalletContract from '@/app/utils/getMultiSigWalletContract'
import lyra from '@/app/utils/lyra'

import useFetch from '../data/useBlockFetch'
import { useMutate } from '../data/useFetch'

export type MultiSigTransaction = {
  destination: string
  value: BigNumber
  data: string
  executed: boolean
  methodName?: string
  decodedData?: Record<string, BigNumber>
  contractId?: string | null
}

export type CreateOptionBoardTransaction = MultiSigTransaction & {
  methodName: 'createOptionBoard'
  decodedData: {
    expiry: BigNumber
    baseIV: BigNumber
    strikePrices: BigNumber[]
    skews: BigNumber[]
    frozen: boolean
  }
}

export type AddStrikeToBoardTransaction = MultiSigTransaction & {
  methodName: 'addStrikeToBoard'
  decodedData: {
    boardId: BigNumber
    strikePrice: BigNumber
    skew: BigNumber
  }
}

const fetcher = async (owner: string, transactionId: BigNumber) => {
  const multiSigWallet = getMultiSigWalletContract(owner)
  const transaction = await multiSigWallet.transactions(transactionId)
  const markets = await lyra.markets()
  const method = hexlify(transaction.data.slice(0, 10))

  // Check if transaction was a market contract call
  const marketAndContract = markets
    .map(market => {
      const contractAndId = getLyraMarketContractFromAddress(lyra, transaction.destination, market.contractAddresses)
      return {
        market,
        contract: contractAndId ? contractAndId.contract : null,
        contractId: contractAndId ? contractAndId.contractId : null,
      }
    })
    .find(marketAndContract => marketAndContract.contract)

  if (marketAndContract && marketAndContract.contract) {
    const { market, contract, contractId } = marketAndContract
    const fragment = contract.interface.getFunction(method)
    const decodedData = contract.interface.decodeFunctionData(method, transaction.data)
    return {
      ...transaction,
      methodName: `${fragment.name} ${market.name}`,
      decodedData,
      contractId,
    }
  }
  // Check if transaction was any other known contract call
  const contractIdAndAddress = Object.values(LyraContractId)
    .filter(c => c !== LyraContractId.TestFaucet)
    .map(contractId => ({ contractId, address: getLyraContractAddress(lyra.deployment, contractId) }))
    .find(contractIdAndAddress => contractIdAndAddress.address === transaction.destination)

  if (contractIdAndAddress) {
    const { contractId } = contractIdAndAddress
    const contract = getLyraContract(lyra.provider, lyra.deployment, contractId)
    const fragment = contract.interface.getFunction(method)
    const decodedData = contract.interface.decodeFunctionData(method, transaction.data)
    return {
      ...transaction,
      methodName: fragment.name,
      decodedData,
      contractId,
    }
  }
  return transaction
}

export default function useMultiSigTransaction(
  owner: string | null,
  transactionId: BigNumber
): MultiSigTransaction | CreateOptionBoardTransaction | AddStrikeToBoardTransaction | null {
  const [transaction] = useFetch(
    Network.Optimism,
    'MultiSigTransaction',
    owner ? [owner, transactionId] : null,
    fetcher
  )
  return transaction
}

export function useMutateMultiSigTransaction(
  owner: string | null,
  transactionId: BigNumber
): () => Promise<MultiSigTransaction | CreateOptionBoardTransaction | AddStrikeToBoardTransaction | null> {
  const mutate = useMutate('MultiSigTransaction', fetcher)
  return useCallback(async () => (owner ? await mutate(owner, transactionId) : null), [mutate, owner, transactionId])
}
