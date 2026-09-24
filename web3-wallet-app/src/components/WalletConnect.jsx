import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useDisconnect } from 'wagmi'
import { shortenAddress } from '../utils/format'

export default function WalletConnect() {
  const { disconnect } = useDisconnect()

  return (
    <div className="panel wallet-panel">
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, openChainModal, mounted }) => {
          const ready = mounted
          const connected = ready && account && chain

          if (!ready) return null

          return (
            <>
              <div className="status-row">
                <span
                  className={
                    'dot ' + (connected ? (chain.unsupported ? 'dot--warn' : 'dot--on') : 'dot--off')
                  }
                />
                <span>
                  {connected
                    ? chain.unsupported
                      ? 'Connected · unsupported network'
                      : 'Connected'
                    : 'Not connected'}
                </span>
              </div>

              {connected && (
                <div className="address-row">
                  <code title={account.address}>{shortenAddress(account.address)}</code>
                  <button className="btn-ghost" onClick={() => navigator.clipboard.writeText(account.address)}>
                    Copy
                  </button>
                </div>
              )}

              {connected && chain.unsupported && (
                <div className="warn-box">
                  Please switch to a supported network.
                  <button className="btn-secondary" onClick={openChainModal}>
                    Switch network
                  </button>
                </div>
              )}

              {connected && !chain.unsupported && (
                <div className="network-row muted">
                  Network:{' '}
                  <button className="btn-ghost btn-ghost--inline" onClick={openChainModal}>
                    {chain.name}
                  </button>
                </div>
              )}

              <div className="btn-row">
                {connected ? (
                  <button className="btn-secondary" onClick={() => disconnect()}>
                    Disconnect
                  </button>
                ) : (
                  <button className="btn-primary" onClick={openConnectModal}>
                    Connect Wallet
                  </button>
                )}
              </div>
            </>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}
