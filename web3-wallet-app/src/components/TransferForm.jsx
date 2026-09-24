import { useEffect, useState } from 'react'
import { isAddress, parseUnits } from 'viem'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { ERC20_ABI } from '../abi/erc20'

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS

export default function TransferForm({ onTransferConfirmed }) {
  const { isConnected, chain } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState(null)

  const { data: decimals } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: !!TOKEN_ADDRESS },
  })

  const {
    writeContract,
    data: txHash,
    isPending: isSubmitting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    if (isConfirmed) {
      setRecipient('')
      setAmount('')
      onTransferConfirmed?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed])

  const disabled = !isConnected || chain?.unsupported || !TOKEN_ADDRESS

  const validate = () => {
    if (!isAddress(recipient)) return 'Enter a valid recipient address.'
    if (!amount || Number(amount) <= 0) return 'Enter an amount greater than 0.'
    if (decimals === undefined) return 'Token info still loading — try again in a moment.'
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError(null)
    resetWrite()

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    writeContract({
      address: TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipient, parseUnits(amount, decimals)],
    })
  }

  // Surface wagmi/viem write errors (rejected tx, revert, etc.) in the same box.
  const displayError =
    formError ||
    (writeError &&
      (writeError.shortMessage?.includes('User rejected')
        ? 'Transaction was rejected.'
        : writeError.shortMessage || writeError.message))

  return (
    <div className="panel">
      <h2>Transfer Tokens</h2>

      {!TOKEN_ADDRESS && <p className="muted">Set VITE_TOKEN_ADDRESS in your .env file to enable this.</p>}

      <form onSubmit={handleSubmit} className="transfer-form">
        <label>
          Recipient address
          <input
            type="text"
            placeholder="0x…"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={disabled || isSubmitting || isConfirming}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled || isSubmitting || isConfirming}
          />
        </label>

        {displayError && <div className="error-box">{displayError}</div>}

        {txHash && !displayError && (
          <div className="success-box">
            {isConfirming && 'Waiting for confirmation… '}
            {isConfirmed && 'Confirmed. '}
            Tx: <code>{txHash.slice(0, 10)}…</code>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={disabled || isSubmitting || isConfirming}>
          {isSubmitting ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : 'Send'}
        </button>

        {!isConnected && <p className="muted small">Connect your wallet to send tokens.</p>}
        {isConnected && chain?.unsupported && (
          <p className="muted small">Switch to a supported network to send tokens.</p>
        )}
      </form>
    </div>
  )
}
