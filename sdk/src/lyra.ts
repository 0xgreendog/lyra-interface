import { BigNumber } from '@ethersproject/bignumber'
import { PopulatedTransaction } from '@ethersproject/contracts'
import { JsonRpcProvider, TransactionReceipt } from '@ethersproject/providers'
import { GraphQLClient } from 'graphql-request'

import { WethLyraStaking } from '.'
import { Account } from './account'
import { AccountRewardEpoch } from './account_reward_epoch'
import { Admin } from './admin'
import { Board } from './board'
import { CollateralUpdateEvent } from './collateral_update_event'
import { Deployment } from './constants/contracts'
import { GlobalRewardEpoch } from './global_reward_epoch'
import { LiquidityDeposit } from './liquidity_deposit'
import { LiquidityWithdrawal } from './liquidity_withdrawal'
import { LyraStake } from './lyra_stake'
import { LyraStaking } from './lyra_staking'
import { LyraUnstake } from './lyra_unstake'
import { Market, MarketContractAddresses, MarketTradeOptions } from './market'
import { Option } from './option'
import { Position, PositionFilter, PositionLeaderboard, PositionLeaderboardFilter } from './position'
import { Quote, QuoteOptions } from './quote'
import getQuoteBoard from './quote/getQuoteBoard'
import { SettleEvent } from './settle_event'
import { Strike } from './strike'
import { Trade } from './trade'
import { TradeEvent, TradeEventListener, TradeEventListenerCallback, TradeEventListenerOptions } from './trade_event'
import { TransferEvent } from './transfer_event'
import fetchLeaderboard from './utils/fetchLeaderboard'
import fetchPositionEventDataByHash from './utils/fetchPositionEventDataByHash'
import getLyraDeploymentForChainId from './utils/getLyraDeploymentForChainId'
import getLyraDeploymentProvider from './utils/getLyraDeploymentProvider'
import getLyraDeploymentSubgraphURI from './utils/getLyraDeploymentSubgraphURI'
import getMarketAddresses from './utils/getMarketAddresses'

export type LyraConfig = {
  provider: JsonRpcProvider
  subgraphUri?: string
}

export { Deployment } from './constants/contracts'

export default class Lyra {
  deployment: Deployment
  provider: JsonRpcProvider
  subgraphUri: string
  subgraphClient: GraphQLClient
  constructor(config: LyraConfig | Deployment | number = Deployment.Mainnet) {
    if (typeof config === 'object') {
      // Config
      const configObj = config as LyraConfig
      this.provider = config.provider
      this.deployment = getLyraDeploymentForChainId(this.provider.network.chainId)
      this.subgraphUri = configObj?.subgraphUri ?? getLyraDeploymentSubgraphURI(this.deployment)
    } else if (typeof config === 'number') {
      // Chain ID
      this.deployment = getLyraDeploymentForChainId(config)
      this.provider = getLyraDeploymentProvider(this.deployment)
      this.subgraphUri = getLyraDeploymentSubgraphURI(this.deployment)
    } else {
      // String
      this.deployment = config
      this.provider = getLyraDeploymentProvider(this.deployment)
      this.subgraphUri = getLyraDeploymentSubgraphURI(this.deployment)
    }

    this.subgraphClient = new GraphQLClient(this.subgraphUri)
  }

  // Quote

  async quote(
    marketAddressOrName: string,
    strikeId: number,
    isCall: boolean,
    isBuy: boolean,
    size: BigNumber,
    options?: QuoteOptions
  ): Promise<Quote> {
    const market = await this.market(marketAddressOrName)
    return await market.quote(strikeId, isCall, isBuy, size, options)
  }

  async quoteBoard(
    marketAddressOrName: string,
    boardId: number,
    size: BigNumber
  ): Promise<{ bid: Quote; ask: Quote; option: Option }[]> {
    const board = await this.board(marketAddressOrName, boardId)
    return getQuoteBoard(board, size)
  }

  // Trade

  async trade(
    owner: string,
    marketAddressOrName: string,
    strikeId: number,
    isCall: boolean,
    isBuy: boolean,
    size: BigNumber,
    slippage: number,
    options?: MarketTradeOptions
  ): Promise<Trade> {
    const market = await this.market(marketAddressOrName)
    return await market.trade(owner, strikeId, isCall, isBuy, size, slippage, options)
  }

  onTrade(callback: TradeEventListenerCallback, options?: TradeEventListenerOptions): TradeEventListener {
    return TradeEvent.on(this, callback, options)
  }

  // Market

  async markets(): Promise<Market[]> {
    return await Market.getAll(this)
  }

  async contractAddresses(): Promise<MarketContractAddresses[]> {
    return await getMarketAddresses(this)
  }

  async marketAddresses(): Promise<string[]> {
    return (await this.contractAddresses()).map(({ optionMarket }) => optionMarket)
  }

  async market(marketAddressOrName: string): Promise<Market> {
    return await Market.get(this, marketAddressOrName)
  }

  async board(marketAddressOrName: string, boardId: number): Promise<Board> {
    return await Board.get(this, marketAddressOrName, boardId)
  }

  async strike(marketAddressOrName: string, strikeId: number): Promise<Strike> {
    return await Strike.get(this, marketAddressOrName, strikeId)
  }

  async option(marketAddressOrName: string, strikeId: number, isCall: boolean): Promise<Option> {
    return await Option.get(this, marketAddressOrName, strikeId, isCall)
  }

  // Position

  async openPositions(owner: string): Promise<Position[]> {
    return await Position.getOpenByOwner(this, owner)
  }

  async positions(owner: string): Promise<Position[]> {
    return await Position.getByOwner(this, owner)
  }

  async allPositions(options?: PositionFilter): Promise<Position[]> {
    return await Position.getAll(this, options)
  }

  async position(marketAddressOrName: string, positionId: number): Promise<Position> {
    return await Position.get(this, marketAddressOrName, positionId)
  }

  async events(transactionHashOrReceipt: string | TransactionReceipt): Promise<{
    trades: TradeEvent[]
    collateralUpdates: CollateralUpdateEvent[]
    transfers: TransferEvent[]
    settles: SettleEvent[]
  }> {
    return await fetchPositionEventDataByHash(this, transactionHashOrReceipt)
  }

  async leaderboard(options?: PositionLeaderboardFilter): Promise<PositionLeaderboard[]> {
    return await fetchLeaderboard(this, options)
  }

  // Account

  account(address: string): Account {
    return Account.get(this, address)
  }

  async approveStableToken(owner: string, tokenAddress: string, amount: BigNumber): Promise<PopulatedTransaction> {
    return await Account.get(this, owner).approveStableToken(tokenAddress, amount)
  }

  async approveBaseToken(owner: string, tokenAddress: string, amount: BigNumber): Promise<PopulatedTransaction> {
    return await Account.get(this, owner).approveBaseToken(tokenAddress, amount)
  }

  async approveOptionToken(
    owner: string,
    marketAddressOrName: string,
    isAllowed: boolean
  ): Promise<PopulatedTransaction> {
    const account = await Account.get(this, owner)
    return await account.approveOptionToken(marketAddressOrName, isAllowed)
  }

  async drip(owner: string): Promise<PopulatedTransaction> {
    const account = await Account.get(this, owner)
    return await account.drip()
  }

  // Liquidity Deposits

  async liquidityDeposits(marketAddressOrName: string, owner: string): Promise<LiquidityDeposit[]> {
    return await LiquidityDeposit.getByOwner(this, marketAddressOrName, owner)
  }

  async liquidityDeposit(marketAddressOrName: string, id: string): Promise<LiquidityDeposit> {
    return await LiquidityDeposit.getByQueueId(this, marketAddressOrName, id)
  }

  async deposit(
    beneficiary: string,
    marketAddressOrName: string,
    amountQuote: BigNumber
  ): Promise<PopulatedTransaction | null> {
    return await LiquidityDeposit.deposit(this, marketAddressOrName, beneficiary, amountQuote)
  }

  // Liquidity Withdrawals

  async liquidityWithdrawals(marketAddressOrName: string, owner: string): Promise<LiquidityWithdrawal[]> {
    return await LiquidityWithdrawal.getByOwner(this, marketAddressOrName, owner)
  }

  async liquidityWithdrawal(marketAddressOrName: string, id: string): Promise<LiquidityWithdrawal> {
    return await LiquidityWithdrawal.getByQueueId(this, marketAddressOrName, id)
  }

  async withdraw(
    beneficiary: string,
    marketAddressOrName: string,
    amountLiquidityTokens: BigNumber
  ): Promise<PopulatedTransaction | null> {
    return await LiquidityWithdrawal.withdraw(this, marketAddressOrName, beneficiary, amountLiquidityTokens)
  }

  // Admin

  admin(): Admin {
    return Admin.get(this)
  }

  // Rewards

  async lyraStaking(): Promise<LyraStaking> {
    return await LyraStaking.get(this)
  }

  async stake(address: string, amount: BigNumber): Promise<LyraStake> {
    return await LyraStake.get(this, address, amount)
  }

  async requestUnstake(address: string): Promise<PopulatedTransaction> {
    const account = this.account(address)
    return await account.requestUnstake()
  }

  async unstake(address: string, amount: BigNumber): Promise<LyraUnstake> {
    return await LyraUnstake.get(this, address, amount)
  }

  async globalRewardEpochs(): Promise<GlobalRewardEpoch[]> {
    return await GlobalRewardEpoch.getAll(this)
  }

  async latestGlobalRewardEpoch(): Promise<GlobalRewardEpoch> {
    return await GlobalRewardEpoch.getLatest(this)
  }

  async accountRewardEpochs(address: string): Promise<AccountRewardEpoch[]> {
    return await AccountRewardEpoch.getByOwner(this, address)
  }

  async wethLyraStaking(): Promise<WethLyraStaking> {
    return await WethLyraStaking.get(this)
  }
}
