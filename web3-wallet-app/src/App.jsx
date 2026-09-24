import { useState } from 'react'
import WalletConnect from './components/WalletConnect'
import TokenBalance from './components/TokenBalance'
import TransferForm from './components/TransferForm'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" />
          <span>Token Wallet</span>
        </div>
      </header>

      <main className="app-main">
        <WalletConnect />
        <TokenBalance refreshKey={refreshKey} />
        <TransferForm onTransferConfirmed={() => setRefreshKey((k) => k + 1)} />
      </main>
    </div>
  )
}
