import Button from '@lyra/ui/components/Button'
import Flex from '@lyra/ui/components/Flex'
import Modal from '@lyra/ui/components/Modal'
import ButtonShimmer from '@lyra/ui/components/Shimmer/ButtonShimmer'
import Text from '@lyra/ui/components/Text'
import { Network } from '@lyrafinance/lyra-js'
import { TokenInfo } from '@uniswap/token-lists'
import React, { useState } from 'react'

import { LogEvent } from '@/app/constants/logEvents'
import useEthBalance from '@/app/hooks/account/useEthBalance'
import withSuspense from '@/app/hooks/data/withSuspense'
import logEvent from '@/app/utils/logEvent'

import { ONBOARDING_MODAL_WIDTH } from '../../../constants/layout'
import OnboardingModalStepOne from './OnboardingModalStepOne'
import OnboardingModalStepTwo from './OnboardingModalStepTwo'

export enum OnboardingMethod {
  Bridge = 'Bridge',
  Exchange = 'Exchange',
  Card = 'Card',
  Swap = 'Swap',
}

export enum OnboardingModalInsufficientToken {
  Stable = 'Stable',
  Base = 'Base',
  Eth = 'Eth',
}

export enum OnboardingModalStep {
  GetETH = 'GetETH',
  GetTokens = 'GetTokens',
}

type Props = {
  network: Network
  isOpen: boolean
  onClose: () => void
  toToken?: TokenInfo | null
  defaultSourceToken?: string
  defaultDestToken?: string
  step?: OnboardingModalStep
}

type OnboardingModalCallToActionProps = {
  network: Network
  toToken?: TokenInfo | null
  onboardingStep?: OnboardingModalStep
  onClickOnboardingStep: (step: OnboardingModalStep) => void
  onClose: () => void
}

const OnboardingModalTitle = ({
  network,
  step,
  toToken,
}: {
  network: Network
  step?: OnboardingModalStep
  toToken?: TokenInfo | null
}): JSX.Element => {
  if (step === OnboardingModalStep.GetETH) {
    return (
      <Flex ml={[8, 2]} mt={[4, 0]} flexDirection="column">
        <Text variant="secondary" color="secondaryText">
          Step 1 of 2
        </Text>
        <Text variant="heading">Deposit ETH to {network}</Text>
      </Flex>
    )
  } else if (step === OnboardingModalStep.GetTokens) {
    return (
      <Flex ml={[8, 2]} mt={[4, 0]} flexDirection="column">
        <Text variant="secondary" color="secondaryText">
          Step 2 of 2
        </Text>
        {!toToken || ['susd', 'usdc', 'dai'].includes(toToken?.symbol.toLowerCase()) ? (
          <Text variant="heading">Swap to Stables</Text>
        ) : (
          <Text variant="heading">Swap to Base Collateral</Text>
        )}
      </Flex>
    )
  }
  return <></>
}

const OnboardingModalCallToAction = withSuspense(
  ({ network, toToken, onboardingStep, onClickOnboardingStep, onClose }: OnboardingModalCallToActionProps) => {
    const isStepOne = onboardingStep === OnboardingModalStep.GetETH
    // TODO: @dappbeast re-implement check for specific markets
    const hasToTokenBalance = false
    const ethBalance = useEthBalance(Network.Optimism)
    return (
      <Flex mx={8} mb={6}>
        <Button
          width="100%"
          size="lg"
          label={isStepOne ? 'Cancel' : 'Previous Step'}
          onClick={() => {
            if (isStepOne) {
              logEvent(LogEvent.OnboardingModalStepOneCancelClick)
              onClose()
            } else {
              onClickOnboardingStep(OnboardingModalStep.GetETH)
              logEvent(LogEvent.OnboardingModalStepTwoCancelClick)
            }
          }}
          variant="default"
        />
        <Button
          ml={4}
          width="100%"
          size="lg"
          label={isStepOne ? 'Next Step' : 'Done'}
          onClick={() => {
            if (isStepOne) {
              logEvent(LogEvent.OnboardingModalStepOneSuccessClick)
              onClickOnboardingStep(OnboardingModalStep.GetTokens)
            } else {
              logEvent(LogEvent.OnboardingModalStepTwoSuccessClick)
              onClose()
            }
          }}
          variant={isStepOne ? (ethBalance.gt(0) ? 'primary' : 'default') : hasToTokenBalance ? 'primary' : 'default'}
        />
      </Flex>
    )
  },
  () => {
    return (
      <Flex mx={8} mb={6}>
        <ButtonShimmer width="100%" size="lg" />
        <ButtonShimmer width="100%" size="lg" ml={4} />
      </Flex>
    )
  }
)

export default function OnboardingModal({
  network,
  isOpen,
  onClose,
  toToken,
  step,
  defaultSourceToken,
  defaultDestToken,
}: Props): JSX.Element {
  const [onboardingStep, setOnboardingStep] = useState(step)
  const isStepOne = onboardingStep === OnboardingModalStep.GetETH
  const isStepTwo = onboardingStep === OnboardingModalStep.GetTokens
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setOnboardingStep(step)
        onClose()
      }}
      title={<OnboardingModalTitle network={network} step={onboardingStep} toToken={toToken} />}
      width={ONBOARDING_MODAL_WIDTH}
      isMobileFullscreen
    >
      {isStepOne ? (
        <OnboardingModalStepOne defaultSourceToken={defaultSourceToken} defaultDestToken={defaultDestToken} />
      ) : null}
      {isStepTwo ? <OnboardingModalStepTwo toToken={toToken} /> : null}
      <OnboardingModalCallToAction
        network={network}
        toToken={toToken}
        onboardingStep={onboardingStep}
        onClickOnboardingStep={setOnboardingStep}
        onClose={onClose}
      />
      <Text variant="small" color="secondaryText" mx={8} mb={6}>
        These are links to independent service providers for your convenience only. These do not constitute any
        recommendation or endorsement of the providers' services. We have no relationship with them and have no control
        over their operations. You are responsible for all risks and liabilities associated with interacting with them.
      </Text>
    </Modal>
  )
}
