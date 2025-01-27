import { Trade } from '@lyrafinance/lyra-js'
import { useCallback } from 'react'

import { useMutateTradeBalances } from '../market/useTradeBalances'

export default function useMutateTradeApprove(trade: Trade) {
  const mutateTradeBalances = useMutateTradeBalances(trade.market())
  return useCallback(async () => {
    await mutateTradeBalances()
  }, [mutateTradeBalances])
}
