import { PopulatedTransaction } from '@ethersproject/contracts'

import Lyra from '../lyra'

export default function buildTx(lyra: Lyra, to: string, from: string, data: string): PopulatedTransaction {
  return {
    to,
    data,
    from,
    chainId: lyra.provider.network.chainId,
  }
}
