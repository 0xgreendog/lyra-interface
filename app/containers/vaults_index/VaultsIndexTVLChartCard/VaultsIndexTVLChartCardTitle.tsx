import Box from '@lyra/ui/components/Box'
import TextShimmer from '@lyra/ui/components/Shimmer/TextShimmer'
import Text from '@lyra/ui/components/Text'
import { MarginProps, PaddingProps } from '@lyra/ui/types'
import formatPercentage from '@lyra/ui/utils/formatPercentage'
import formatTruncatedUSD from '@lyra/ui/utils/formatTruncatedUSD'
import React, { useMemo } from 'react'

import { ChartPeriod } from '@/app/constants/chart'
import withSuspense from '@/app/hooks/data/withSuspense'
import useVaultsTVLHistory, { VaultsTVLSnapshot } from '@/app/hooks/vaults/useVaultsTVLHistory'

type Props = {
  hoverData: VaultsTVLSnapshot | null
  period: ChartPeriod
} & MarginProps &
  PaddingProps

const VaultsIndexTVLChartCardTitle = withSuspense(
  ({ hoverData, period, ...styleProps }: Props) => {
    const vaultHistoryTVL = useVaultsTVLHistory(period)
    const vaultBalanceTVL = useMemo(() => vaultHistoryTVL[vaultHistoryTVL.length - 1], [vaultHistoryTVL])
    const total = hoverData?.total ?? vaultBalanceTVL.total
    const earliestHistory = vaultHistoryTVL[0]
    const earliestTotal = earliestHistory.total ?? 0
    const pctChangeTotal = earliestTotal > 0 ? (total - earliestTotal) / earliestTotal : 0
    return (
      <Box {...styleProps}>
        <Text variant="heading">TVL</Text>
        <Text variant="heading">{formatTruncatedUSD(total)}</Text>
        <Text variant="small" color={pctChangeTotal >= 0 ? 'primaryText' : 'errorText'}>
          {formatPercentage(pctChangeTotal)}
        </Text>
      </Box>
    )
  },
  ({ hoverData, period, ...styleProps }) => (
    <Box {...styleProps}>
      <Text variant="heading">TVL</Text>
      <TextShimmer variant="heading" />
      <TextShimmer variant="small" width={50} />
    </Box>
  )
)

export default VaultsIndexTVLChartCardTitle
