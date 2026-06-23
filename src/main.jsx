import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { baseAccount, injected } from 'wagmi/connectors'
import './index.css'
import App from './App.jsx'

const builderCodeSuffix =
  import.meta.env.VITE_BASE_BUILDER_CODE_SUFFIX ||
  '0x62635f3234356d693430700b0080218021802180218021802180218021'

const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    baseAccount({
      metadata: {
        appName: 'Based Guestbook x402',
        appLogoUrl: 'https://based-guestbook-x402.vercel.app/favicon.svg',
      },
      preference: {
        attribution: {
          dataSuffix: builderCodeSuffix,
        },
      },
    }),
    injected({
      target: 'metaMask',
    }),
    injected({
      target: 'coinbaseWallet',
    }),
    injected({
      target: 'rabby',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
