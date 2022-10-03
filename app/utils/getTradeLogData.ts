import { CollateralUpdateEvent, Trade, TradeEvent } from '@lyrafinance/lyra-js'

import { LogData } from './logEvent'

export default function getTradeLogData(trade: Trade | TradeEvent | CollateralUpdateEvent): LogData {
  return {
    marketName: trade.marketName,
    expiryTimestamp: trade.expiryTimestamp,
    strikeId: trade.strikeId,
    strikePrice: trade.strikePrice,
    isCall: trade.isCall,
    isBuy: !(trade instanceof CollateralUpdateEvent) ? trade.isBuy : undefined,
    isLong: !(trade instanceof CollateralUpdateEvent) ? trade.isLong : undefined,
    isOpen: !(trade instanceof CollateralUpdateEvent) ? trade.isOpen : undefined,
    positionId: trade.positionId,
    premium: !(trade instanceof CollateralUpdateEvent) ? trade.premium : undefined,
    fee: !(trade instanceof CollateralUpdateEvent) ? trade.fee : undefined,
    size: !(trade instanceof CollateralUpdateEvent) ? trade.size : undefined,
    iv: !(trade instanceof CollateralUpdateEvent) ? trade.iv : undefined,
    slippage: trade instanceof Trade ? trade.slippage : undefined,
    setToCollateral:
      trade instanceof Trade
        ? trade.collateral?.amount
        : trade instanceof TradeEvent
        ? trade.collateralAmount
        : trade.amount,
    isBaseCollateral: trade instanceof Trade ? trade.collateral?.isBase : trade.isBaseCollateral,
  }
}
