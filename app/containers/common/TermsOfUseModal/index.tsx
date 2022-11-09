import Box from '@lyra/ui/components/Box'
import Button from '@lyra/ui/components/Button'
import CardBody from '@lyra/ui/components/Card/CardBody'
import Flex from '@lyra/ui/components/Flex'
import Checkbox from '@lyra/ui/components/Input/Checkbox'
import Link from '@lyra/ui/components/Link'
import Modal from '@lyra/ui/components/Modal'
import Text from '@lyra/ui/components/Text'
import React, { useState } from 'react'

import { TERMS_OF_USE_URL } from '@/app/constants/links'
import useWallet from '@/app/hooks/wallet/useWallet'
import isScreeningEnabled from '@/app/utils/isScreeningEnabled'
import isTermsOfUseEnabled from '@/app/utils/isTermsOfUseEnabled'
import postTermsOfUse from '@/app/utils/postTermsOfUse'

type Props = {
  isOpen: boolean
  onConfirm: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
  onClose: () => void
}

export default function TermsOfUseModal({ isOpen, onClose, onConfirm }: Props) {
  const [isAChecked, setIsAChecked] = useState(false)
  const { account } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  if (!isTermsOfUseEnabled() || !account) {
    // Ignore terms when account is not connected or we're on testnet
    return null
  }
  return (
    <Modal title="Disclaimer" isOpen={isOpen} onClose={onClose} width={600}>
      <CardBody>
        <Text color="secondaryText" mb={6}>
          Check the box below to confirm your agreement to the&nbsp;
          <Link href={TERMS_OF_USE_URL} target="_blank">
            Terms of Use:
          </Link>
        </Text>
        <Flex mb={6} alignItems="center" onClick={() => setIsAChecked(!isAChecked)} sx={{ cursor: 'pointer' }}>
          <Box mr={2} minWidth={36}>
            <Checkbox checked={isAChecked} onToggle={setIsAChecked} />
          </Box>
          <Text color="secondaryText">
            In case of an investigation by any federal entity or similar, I do not have any involvement with this group
            or with the people in it, I do not know how I am here, probably added by a third party, I do not support any
            actions by the member of this group.
          </Text>
        </Flex>
        <Button
          width="100%"
          isDisabled={!isAChecked}
          label="Confirm"
          variant="primary"
          isLoading={isLoading}
          size="lg"
          onClick={e => {
            if (isScreeningEnabled()) {
              setIsLoading(true)
              postTermsOfUse(account)
                .then(ok => {
                  if (ok) {
                    onConfirm(e)
                    onClose()
                  }
                  setIsLoading(false)
                })
                .catch(() => setIsLoading(false))
            } else {
              onConfirm(e)
              onClose()
            }
          }}
        />
      </CardBody>
    </Modal>
  )
}
