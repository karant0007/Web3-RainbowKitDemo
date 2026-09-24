# Token Wallet — Web3 Frontend Assessment

A small React + Vite dApp that:

- Connects to MetaMask, any browser wallet, or a mobile wallet via WalletConnect (through RainbowKit's connect modal)
- Shows the connected address and live connection status
- Reacts to account switches and network switches without a page reload (wagmi handles this)
- Reads and displays an ERC-20 token balance for the connected wallet
- Provides a Transfer form (recipient + amount) that calls `transfer()` on the token contract

Built with **React 18**, **Vite**, **wagmi v2**, **viem**, and **RainbowKit**.

## Project structure

```
web3-wallet-app/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx           # WagmiProvider + QueryClientProvider + RainbowKitProvider setup
    ├── wagmi.js            # chains + connector config (getDefaultConfig)
    ├── App.jsx
    ├── index.css
    ├── abi/
    │   └── erc20.js         # minimal ERC-20 ABI (balanceOf, decimals, symbol, transfer)
    ├── utils/
    │   └── format.js        # address shortening helper
    └── components/
        ├── WalletConnect.jsx  # RainbowKit ConnectButton.Custom, styled to match the app
        ├── TokenBalance.jsx   # useReadContracts -> balanceOf/decimals/symbol
        └── TransferForm.jsx   # useWriteContract + useWaitForTransactionReceipt -> transfer()
```

### Why wagmi + RainbowKit instead of raw `window.ethereum`

The first pass of this project talked to `window.ethereum` directly via ethers.js. This version swaps that for **wagmi** (React hooks for account/chain/contract state) and **RainbowKit** (the connect-wallet modal UI on top of it). The practical differences:

- Multiple wallets are supported out of the box (MetaMask, Rabby, Coinbase Wallet, WalletConnect for mobile wallets, etc.) with a proper picker modal, instead of silently grabbing whatever `window.ethereum` points to.
- Account/network change handling, reconnect-on-refresh, and "wrong network" UI all come from wagmi's hooks (`useAccount`, `chain.unsupported`) rather than hand-rolled `accountsChanged`/`chainChanged` listeners.
- Contract reads/writes (`useReadContracts`, `useWriteContract`, `useWaitForTransactionReceipt`) replace manual `ethers.Contract` calls and manual loading/error state.

## 1. Prerequisites

- **Node.js 18+** and npm
- **MetaMask** (or another browser wallet extension) installed in your browser
- A wallet funded with a small amount of a test ERC-20 token on whatever network you configure (see below)

## 2. Install dependencies

```bash
cd web3-wallet-app
npm install
```

## 3. Configure the app

Copy the example env file:

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable | Description |
|---|---|
| `VITE_TOKEN_ADDRESS` | The ERC-20 token contract address to read balances from / transfer |
| `VITE_WALLETCONNECT_PROJECT_ID` | Free project ID that powers the WalletConnect/mobile-wallet option in the connect modal |

**Getting a WalletConnect project ID** (takes ~2 minutes, free):
1. Go to `https://cloud.reown.com` (Reown is WalletConnect's parent brand) and sign up.
2. Create a new project, copy its **Project ID**.
3. Paste it into `VITE_WALLETCONNECT_PROJECT_ID`.

You can skip this and leave the placeholder if you'll only demo with a browser extension wallet (MetaMask etc.) — extension wallets still work fine. You'll just see a console warning and the WalletConnect/QR option in the modal won't function.

**If you don't have a test token handy**, the quickest path for an assessment demo is:

1. Add the **Sepolia** test network in MetaMask (built in on recent versions — Settings → Networks → Show test networks). Sepolia is included by default in this app's chain list (`src/wagmi.js`), along with Mainnet, Polygon, and Polygon Amoy.
2. Get free Sepolia ETH from a faucet (e.g. `https://sepoliafaucet.com`) to pay for gas.
3. Use any existing Sepolia ERC-20 test token address, or deploy your own trivial ERC-20 (e.g. via Remix, using OpenZeppelin's `ERC20` contract) and mint yourself a balance.
4. Put that token's contract address into `VITE_TOKEN_ADDRESS`.

No RPC URL is required — wagmi's default config uses public RPC endpoints for the configured chains. To change which chains are offered, edit the `chains` array in `src/wagmi.js`.

## 4. Run it

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) in a browser that has MetaMask installed.

## 5. Using the app

1. Click **Connect Wallet** — RainbowKit's modal opens with all available options (MetaMask, other detected extensions, WalletConnect for mobile). Approve the connection.
2. Your address and connection status appear at the top.
   - If you're on an unsupported network, a warning banner appears with a **Switch network** button (opens RainbowKit's network-switch modal).
3. Your token balance for `VITE_TOKEN_ADDRESS` loads automatically underneath.
4. Fill in the **Transfer** form (recipient address + amount) and click **Send**. Confirm the transaction in your wallet. Once it's mined, the balance panel refreshes automatically.
5. Switching accounts or networks inside your wallet updates the whole UI live (no manual refresh needed) — wagmi subscribes to the underlying provider events for you.

## Build for production

```bash
npm run build
npm run preview
```

## Notes on implementation choices

- **wagmi + RainbowKit**: `src/wagmi.js` configures the supported chains and connectors via RainbowKit's `getDefaultConfig`, which wires up injected wallets, WalletConnect, and a handful of popular wallet-specific connectors automatically.
- **Account/network changes**: handled entirely by wagmi internally — components just read reactive hooks (`useAccount`, `chain.unsupported`) and re-render; there's no manual event-listener bookkeeping.
- **Session restore**: wagmi persists and restores the last connection automatically (via its internal storage), so a page refresh doesn't force reconnecting.
- **Reads**: `TokenBalance.jsx` batches `balanceOf` / `decimals` / `symbol` into one `useReadContracts` call and refetches when a transfer confirms (via a `refreshKey` bump passed down from `App.jsx`).
- **Writes**: `TransferForm.jsx` validates the address/amount client-side, then uses `useWriteContract` to send the transaction and `useWaitForTransactionReceipt` to track confirmation — both expose loading/error state directly, so there's no manual try/catch around a raw provider call.
- **Error handling**: rejected transactions, reverts, and RPC errors surface through wagmi's `error` objects (`shortMessage`) and are shown inline in the same error box used for form validation.

## Swapping back to plain ethers.js

If you'd rather not pull in wagmi/RainbowKit (e.g. a reviewer wants to see raw `window.ethereum` handling), the previous iteration of this project used `ethers.js` directly against the injected provider, with a hand-written `useWallet` hook covering `accountsChanged`/`chainChanged`. That approach is smaller (no WalletConnect/RainbowKit bundle) but only supports whichever single injected wallet `window.ethereum` points to. Ask and it can be provided as an alternative branch.
