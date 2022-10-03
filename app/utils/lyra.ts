import Lyra from '@lyrafinance/lyra-js'

import { NETWORK_CONFIGS } from '../constants/networks'
import CachedStaticJsonRpcProvider from './CachedStaticJsonRpcProvider'
import getOptimismChainId from './getOptimismChainId'

const optimismChainId = getOptimismChainId()
const networkConfig = NETWORK_CONFIGS[optimismChainId]
const optimismProvider = new CachedStaticJsonRpcProvider(networkConfig.readRpcUrl, networkConfig.chainId)
const lyra = new Lyra({
  provider: optimismProvider,
})
export default lyra
