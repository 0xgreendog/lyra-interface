import withSuspense from '@lyra/app/hooks/data/withSuspense'
import Card from '@lyra/ui/components/Card'
import CardSection from '@lyra/ui/components/Card/CardSection'
import CardSeparator from '@lyra/ui/components/Card/CardSeparator'
import Text from '@lyra/ui/components/Text'
import { MarginProps } from '@lyra/ui/types'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

import VaultsMyLiquidityBalancesTableOrList from '@/app/components/common/VaultsMyLiquidityBalancesTableOrList'
import VaultsPendingDepositsTableOrList from '@/app/components/common/VaultsPendingDepositsTableOrList'
import VaultsPendingWithdrawalsTableOrList from '@/app/components/common/VaultsPendingWithdrawalsTableOrList'
import VaultsIndexMyLiquiditySection from '@/app/components/vaults_index/VaultsIndexMyLiquiditySection'
import { ZERO_BN } from '@/app/constants/bn'
import { LogEvent } from '@/app/constants/logEvents'
import { PageId } from '@/app/constants/pages'
import useVaultBalances from '@/app/hooks/vaults/useVaultBalances'
import getPagePath from '@/app/utils/getPagePath'
import logEvent from '@/app/utils/logEvent'

type Props = MarginProps

const VaultsIndexMyLiquidityCard = withSuspense(({ ...styleProps }: Props) => {
  const vaultBalances = useVaultBalances()
  const router = useRouter()

  const liquidityDeposits = useMemo(() => {
    return vaultBalances.flatMap(l => l.deposits)
  }, [vaultBalances])

  const liquidityWithdrawals = useMemo(() => {
    return vaultBalances.flatMap(l => l.withdrawals)
  }, [vaultBalances])

  const totalLiquidityBalance = useMemo(() => {
    return vaultBalances.reduce((sum, b) => b.balance.balance.add(sum), ZERO_BN)
  }, [vaultBalances])

  if (totalLiquidityBalance.isZero() && liquidityDeposits.length === 0 && liquidityWithdrawals.length === 0) {
    return null
  }

  return (
    <Card {...styleProps} overflow="hidden">
      <VaultsIndexMyLiquiditySection vaultBalances={vaultBalances} />
      <CardSeparator />
      <CardSection noPadding>
        <Text mx={6} mt={6} mb={[3, 0]} variant="heading">
          Balances
        </Text>
        <VaultsMyLiquidityBalancesTableOrList
          vaultBalances={vaultBalances}
          onClick={({ vault: { market } }) => {
            router.push(getPagePath({ page: PageId.Vaults, marketAddressOrName: market.name }))
            logEvent(LogEvent.NavVaultsTabClick, {
              marketName: market.name,
              marketAddress: market.address,
            })
          }}
        />
      </CardSection>
      {liquidityDeposits.length ? (
        <>
          <CardSeparator />
          <CardSection noPadding>
            <Text variant="heading" mx={6} mt={6}>
              Depositing
            </Text>
            <VaultsPendingDepositsTableOrList
              deposits={liquidityDeposits}
              onClick={deposit =>
                router.push(getPagePath({ page: PageId.Vaults, marketAddressOrName: deposit.market().name }))
              }
            />
          </CardSection>
        </>
      ) : null}
      {liquidityWithdrawals.length ? (
        <>
          <CardSeparator />
          <CardSection noPadding>
            <Text variant="heading" mx={6} mt={6}>
              Withdrawing
            </Text>
            <VaultsPendingWithdrawalsTableOrList
              withdrawals={liquidityWithdrawals}
              onClick={withdrawal =>
                router.push(getPagePath({ page: PageId.Vaults, marketAddressOrName: withdrawal.market().name }))
              }
            />
          </CardSection>
        </>
      ) : null}
    </Card>
  )
})

export default VaultsIndexMyLiquidityCard
