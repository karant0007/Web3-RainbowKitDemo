import { useEffect } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { ERC20_ABI } from '../abi/erc20'

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS

export default function TokenBalance({ refreshKey }) {
  const { address, isConnected } = useAccount()

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
      {
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'symbol',
      },
    ],
    query: {
      enabled: isConnected && !!address && !!TOKEN_ADDRESS,
    },
  })

  // Re-fetch whenever the parent bumps refreshKey (e.g. after a transfer confirms).
  useEffect(() => {
    if (isConnected) refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  if (!isConnected) return null

  if (!TOKEN_ADDRESS) {
    return (
      <div className="panel">
        <h2>Token Balance</h2>
        <p className="muted">Set VITE_TOKEN_ADDRESS in your .env file to enable this.</p>
      </div>
    )
  }

  const [balanceResult, decimalsResult, symbolResult] = data || []
  const rawBalance = balanceResult?.result
  const decimals = decimalsResult?.result
  const symbol = symbolResult?.result || ''

  const balance =
    rawBalance !== undefined && decimals !== undefined ? formatUnits(rawBalance, decimals) : null

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Token Balance</h2>
        <button className="btn-ghost" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isError && (
        <div className="error-box">Could not read token balance. Check the token address and network.</div>
      )}

      {!isError && (
        <div className="balance-figure">
          {balance === null ? '—' : Number(balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
          <span className="balance-symbol">{symbol}</span>
        </div>
      )}
    </div>
  )
}
