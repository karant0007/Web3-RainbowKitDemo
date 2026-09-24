import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, polygon, polygonAmoy } from 'wagmi/chains'

// Get a free projectId from https://cloud.reown.com (formerly WalletConnect
// Cloud) — required for the WalletConnect/mobile-wallet connection option.
// The app still works with browser-extension wallets (MetaMask etc.)
// without a real projectId, but you'll see a console warning until you set one.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const config = getDefaultConfig({
  appName: 'Token Wallet',
  projectId,
  chains: [sepolia, mainnet, polygon, polygonAmoy],
  ssr: false,
})
