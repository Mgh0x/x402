import { useMemo, useState } from 'react'
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useSignMessage,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { concatHex, formatEther, getContractAddress, padHex, parseAbi, toHex } from 'viem'
import { createSiweMessage, generateSiweNonce, verifySiweMessage } from 'viem/siwe'
import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Code2,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Loader2,
  MessageSquareText,
  Plug,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { guestbookAbi, guestbookAddress, guestbookBytecode } from './lib/guestbook'
import './App.css'

const preferredChain = import.meta.env.VITE_TARGET_CHAIN === 'base' ? base : baseSepolia
const builderCode = import.meta.env.VITE_BASE_BUILDER_CODE || 'bc_245mi40p'
const builderCodeSuffix =
  import.meta.env.VITE_BASE_BUILDER_CODE_SUFFIX ||
  '0x62635f3234356d693430700b0080218021802180218021802180218021'

const steps = [
  {
    title: 'Wallet',
    text: 'Connect a Base-ready wallet and keep approvals clean.',
    icon: Wallet,
  },
  {
    title: 'Contract',
    text: 'Write a short onchain message through the deployed guestbook.',
    icon: MessageSquareText,
  },
  {
    title: 'Builder',
    text: 'Use this app URL, GitHub repo, and screenshot for Base Dashboard.',
    icon: Code2,
  },
  {
    title: 'x402',
    text: 'Expose a tiny payment-gated API route for agent/payment signal.',
    icon: KeyRound,
  },
]

const explorerBase = {
  [base.id]: 'https://basescan.org',
  [baseSepolia.id]: 'https://sepolia.basescan.org',
}

const create2Factory = '0x4e59b44847b379578588920cA78FbF26c0B4956C'
const agentRegistrationUri = 'https://based-guestbook-x402.vercel.app/agent.json'
const erc8004IdentityRegistry = {
  [base.id]: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  [baseSepolia.id]: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
}
const erc8004IdentityAbi = parseAbi([
  'function register(string agentURI) returns (uint256 agentId)',
  'function balanceOf(address owner) view returns (uint256)',
])
const agentRegistration = {
  agentId: 56639,
  agentRegistry: 'eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
}

function compact(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function App() {
  const [message, setMessage] = useState('Building on Base with x402.')
  const [apiResult, setApiResult] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false)
  const [deployError, setDeployError] = useState(null)
  const [deployHash, setDeployHash] = useState(null)
  const [identityError, setIdentityError] = useState('')
  const [identityProof, setIdentityProof] = useState(null)
  const [predictedAddress, setPredictedAddress] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const { address, connector, isConnected } = useAccount()
  const chainId = useChainId()
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const publicClient = usePublicClient({ chainId: preferredChain.id })
  const { isPending: isSigningIdentity, signMessageAsync } = useSignMessage()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { data: hash, isPending: isWriting, writeContract } = useWriteContract()
  const {
    data: agentHash,
    isPending: isRegisteringAgent,
    writeContract: writeAgentContract,
  } = useWriteContract()

  const isCorrectChain = chainId === preferredChain.id
  const explorer = explorerBase[preferredChain.id]
  const agentRegistryAddress = erc8004IdentityRegistry[preferredChain.id]
  const { data: balance } = useBalance({
    address,
    chainId: preferredChain.id,
    query: {
      enabled: Boolean(address),
      refetchInterval: 8000,
    },
  })

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    chainId: preferredChain.id,
  })
  const { isLoading: isAgentConfirming, isSuccess: isAgentRegistered } = useWaitForTransactionReceipt({
    hash: agentHash,
    chainId: preferredChain.id,
  })
  const {
    data: deployReceipt,
    isLoading: isDeployConfirming,
    isSuccess: isDeployConfirmed,
  } = useWaitForTransactionReceipt({
    hash: deployHash,
    chainId: preferredChain.id,
  })

  const deployedAddress = deployReceipt?.contractAddress || (isDeployConfirmed ? predictedAddress : '')
  const activeGuestbookAddress = guestbookAddress || deployedAddress
  const hasContract = Boolean(activeGuestbookAddress)
  const formattedBalance = balance?.value === undefined ? 'unknown' : `${Number(formatEther(balance.value)).toFixed(5)} ETH`
  const {
    data: agentIdentityBalance,
    refetch: refetchAgentIdentityBalance,
  } = useReadContract({
    address: agentRegistryAddress,
    abi: erc8004IdentityAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: preferredChain.id,
    query: {
      enabled: Boolean(address && agentRegistryAddress),
      refetchInterval: 10000,
    },
  })
  const agentIdentityCount = agentIdentityBalance === undefined ? 'unknown' : agentIdentityBalance.toString()
  const hasAgentIdentity = typeof agentIdentityBalance === 'bigint' && agentIdentityBalance > 0n

  const {
    data: entries,
    refetch,
    isLoading: entriesLoading,
  } = useReadContract({
    address: activeGuestbookAddress,
    abi: guestbookAbi,
    functionName: 'getRecentEntries',
    args: [8n],
    chainId: preferredChain.id,
    query: {
      enabled: hasContract,
      refetchInterval: 10000,
    },
  })

  const visibleEntries = useMemo(() => {
    if (!entries) return []
    return [...entries].reverse()
  }, [entries])

  async function signGuestbook() {
    if (!hasContract || !message.trim()) return
    writeContract(
      {
        address: activeGuestbookAddress,
        abi: guestbookAbi,
        functionName: 'sign',
        args: [message.trim()],
        chainId: preferredChain.id,
        dataSuffix: builderCodeSuffix,
      },
      {
        onSuccess: () => setMessage(''),
        onSettled: () => setTimeout(() => refetch(), 2500),
      },
    )
  }

  async function deployGuestbook() {
    if (!connector || !address) return
    setDeployError(null)
    setDeployHash(null)
    setIsDeploying(true)
    try {
      const provider = await connector.getProvider()
      const salt = padHex(toHex(Date.now()), { size: 32 })
      const create2Data = concatHex([salt, guestbookBytecode])
      const nextAddress = getContractAddress({
        bytecode: guestbookBytecode,
        from: create2Factory,
        opcode: 'CREATE2',
        salt,
      })
      setPredictedAddress(nextAddress)
      const transactionHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: address,
            to: create2Factory,
            data: create2Data,
            gas: '0x100000',
          },
        ],
      })
      setDeployHash(transactionHash)
    } catch (error) {
      setDeployError(error)
    } finally {
      setIsDeploying(false)
    }
  }

  async function registerAgentIdentity() {
    if (!agentRegistryAddress || !isConnected || !isCorrectChain) return
    writeAgentContract(
      {
        address: agentRegistryAddress,
        abi: erc8004IdentityAbi,
        functionName: 'register',
        args: [agentRegistrationUri],
        chainId: preferredChain.id,
        dataSuffix: builderCodeSuffix,
      },
      {
        onSettled: () => setTimeout(() => refetchAgentIdentityBalance(), 2500),
      },
    )
  }

  async function signBaseIdentity() {
    if (!address || !publicClient || !isCorrectChain) return
    setIdentityError('')
    setIdentityProof(null)
    try {
      const nonce = generateSiweNonce()
      const issuedAt = new Date()
      const message = createSiweMessage({
        address,
        chainId: preferredChain.id,
        domain: window.location.host,
        issuedAt: issuedAt.toISOString(),
        nonce,
        resources: [
          `${window.location.origin}/agent.json`,
          'https://github.com/Mgh0x/x402',
          `${explorer}/address/${activeGuestbookAddress}`,
          `${explorer}/token/${agentRegistryAddress}?a=${agentRegistration.agentId}`,
        ],
        statement: 'Sign in to Based Guestbook x402 and link this wallet to the Base builder app.',
        uri: window.location.origin,
        version: '1',
      })
      const signature = await signMessageAsync({ message })
      const valid = await verifySiweMessage(publicClient, {
        address,
        domain: window.location.host,
        message,
        nonce,
        signature,
      })
      setIdentityProof({
        address,
        connector: connector?.name || 'unknown',
        issuedAt: issuedAt.toISOString(),
        signature,
        valid,
      })
    } catch (error) {
      setIdentityError(error.shortMessage || error.message || 'Signature failed')
    }
  }

  async function copyDiagnostics() {
    const payload = {
      connectedAddress: address,
      currentChainId: chainId,
      expectedChainId: preferredChain.id,
      expectedChainName: preferredChain.name,
      balance: formattedBalance,
      connector: connector?.name || 'unknown',
      deployMethod: 'CREATE2 factory via connector.provider.eth_sendTransaction',
      create2Factory,
      predictedAddress: predictedAddress || null,
      deployHash: deployHash || null,
      deployError: deployError
        ? {
            name: deployError.name,
            shortMessage: deployError.shortMessage,
            message: deployError.message,
          }
        : null,
    }
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    setCopiedDiagnostics(true)
    setTimeout(() => setCopiedDiagnostics(false), 1800)
  }

  async function checkX402() {
    setApiLoading(true)
    setApiResult(null)
    try {
      const response = await fetch('/api/base-signal')
      const text = await response.text()
      setApiResult({
        status: response.status,
        body: text,
        paymentRequired: response.status === 402,
      })
    } catch (error) {
      setApiResult({
        status: 'offline',
        body: error.message,
        paymentRequired: false,
      })
    } finally {
      setApiLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Primary">
        <div className="brand">
          <span className="brand-mark">BG</span>
          <span>Based Guestbook</span>
        </div>
        <div className="wallet-bar">
          <span className={`network-pill ${isCorrectChain ? 'ok' : 'warn'}`}>
            {preferredChain.name}
          </span>
          {isConnected ? (
            <>
              <span className="address-pill">{compact(address)}</span>
              <button className="icon-button" type="button" onClick={() => disconnect()} title="Disconnect">
                <Plug size={18} />
              </button>
            </>
          ) : null}
        </div>
      </nav>

      <section className="hero-grid">
        <div className="hero-copy">
          <h1>Base builder signal, tek ekranda.</h1>
          <p>
            Wallet connect, Base guestbook contract, dashboard-ready app metadata, and a tiny
            x402-protected API route for the agent payments narrative.
          </p>
          <div className="builder-code-chip">Builder Code: {builderCode}</div>
          <div className="hero-actions">
            {!isConnected ? (
              connectors.map((connector) => (
                <button
                  key={connector.uid}
                  className="primary-button"
                  type="button"
                  disabled={isConnecting}
                  onClick={() => connect({ connector, chainId: preferredChain.id })}
                >
                  {isConnecting ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
                  Connect {connector.name}
                </button>
              ))
            ) : !isCorrectChain ? (
              <button
                className="primary-button"
                type="button"
                disabled={isSwitching}
                onClick={() => switchChain({ chainId: preferredChain.id })}
              >
                {isSwitching ? <Loader2 className="spin" size={18} /> : <ArrowUpRight size={18} />}
                Switch to {preferredChain.name}
              </button>
            ) : (
              <a className="primary-button link-button" href="#guestbook">
                <MessageSquareText size={18} />
                Write onchain
              </a>
            )}
          </div>
        </div>

        <div className="signal-panel">
          <div className="panel-header">
            <ShieldCheck size={20} />
            <span>Profile signals</span>
          </div>
          <div className="signal-list">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <article className="signal-row" key={step.title}>
                  <Icon size={19} />
                  <div>
                    <h2>{step.title}</h2>
                    <p>{step.text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="workbench" id="guestbook">
        <div className="compose-panel">
          <div className="section-title">
            <BookOpenText size={20} />
            <h2>Onchain Guestbook</h2>
          </div>
          {!hasContract ? (
            <div className="empty-state">
              <h3>Contract address bekleniyor</h3>
              <p>
                Once the target Base network is selected, deploy from your connected wallet. The deployer
                signal will belong to that wallet.
              </p>
              <div className="diagnostics-row">
                <span>Address: {address ? compact(address) : 'not connected'}</span>
                <span>Chain: {chainId || 'unknown'}</span>
                <span>Balance: {formattedBalance}</span>
              </div>
              <button
                className="primary-button deploy-button"
                type="button"
                disabled={!isConnected || !isCorrectChain || isDeploying || isDeployConfirming}
                onClick={deployGuestbook}
              >
                {isDeploying || isDeployConfirming ? <Loader2 className="spin" size={18} /> : <Code2 size={18} />}
                {isDeployConfirming ? 'Deploy confirming' : 'Deploy Guestbook'}
              </button>
              {deployHash ? (
                <a className="tx-link" href={`${explorer}/tx/${deployHash}`} target="_blank" rel="noreferrer">
                  View deploy transaction <ExternalLink size={15} />
                </a>
              ) : null}
              {deployError ? (
                <p className="error-copy">{deployError.shortMessage || deployError.message}</p>
              ) : null}
              <button
                className="secondary-button diagnostics-button"
                type="button"
                disabled={!isConnected}
                onClick={copyDiagnostics}
              >
                {copiedDiagnostics ? 'Copied diagnostics' : 'Copy diagnostics'}
              </button>
              {isDeployConfirmed && deployedAddress ? (
                <p className="success-copy">Contract deployed: {deployedAddress}</p>
              ) : null}
            </div>
          ) : (
            <>
              <label className="input-label" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                maxLength={180}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Short, natural, builder-style message"
              />
              <div className="compose-footer">
                <span>{message.length}/180</span>
                <button
                  className="primary-button"
                  type="button"
                  disabled={!isConnected || !isCorrectChain || isWriting || isConfirming || !message.trim()}
                  onClick={signGuestbook}
                >
                  {isWriting || isConfirming ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
                  {isConfirming ? 'Confirming' : 'Sign Guestbook'}
                </button>
              </div>
              {hash ? (
                <a className="tx-link" href={`${explorer}/tx/${hash}`} target="_blank" rel="noreferrer">
                  View transaction <ExternalLink size={15} />
                </a>
              ) : null}
              {isConfirmed ? <p className="success-copy">Transaction confirmed. Guestbook refreshed shortly.</p> : null}
            </>
          )}
        </div>

        <div className="entries-panel">
          <div className="section-title">
            <MessageSquareText size={20} />
            <h2>Recent entries</h2>
          </div>
          {entriesLoading ? (
            <div className="loading-row">
              <Loader2 className="spin" size={18} /> Loading entries
            </div>
          ) : visibleEntries.length ? (
            <div className="entry-list">
              {visibleEntries.map((entry, index) => (
                <article className="entry-card" key={`${entry.author}-${entry.timestamp}-${index}`}>
                  <p>{entry.message}</p>
                  <div>
                    <span>{compact(entry.author)}</span>
                    <span>{new Date(Number(entry.timestamp) * 1000).toLocaleString()}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <h3>No entries yet</h3>
              <p>First mainnet message becomes the cleanest builder interaction.</p>
            </div>
          )}
        </div>
      </section>

      <section className="identity-panel">
        <div>
          <div className="section-title">
            <Fingerprint size={20} />
            <h2>Base identity</h2>
          </div>
          <p>
            Sign a SIWE proof for this app domain with the connected wallet. No transaction is sent.
          </p>
          <div className="identity-details">
            <span>Connector: {connector?.name || 'not connected'}</span>
            <span>Wallet: {address ? compact(address) : 'not connected'}</span>
            <span>Agent ID: {agentRegistration.agentId}</span>
          </div>
        </div>
        <button
          className="secondary-button"
          type="button"
          disabled={!isConnected || !isCorrectChain || isSigningIdentity}
          onClick={signBaseIdentity}
        >
          {isSigningIdentity ? <Loader2 className="spin" size={18} /> : <Fingerprint size={18} />}
          {identityProof?.valid ? 'Signed' : 'Sign in with Base'}
        </button>
        {identityProof ? (
          <div className="identity-proof">
            <span className={identityProof.valid ? 'proof-ok' : 'proof-warn'}>
              {identityProof.valid ? 'Signature verified' : 'Signature not verified'}
            </span>
            <span>{compact(identityProof.address)}</span>
            <span>{identityProof.connector}</span>
            <span>{new Date(identityProof.issuedAt).toLocaleString()}</span>
          </div>
        ) : null}
        {identityError ? <p className="error-copy">{identityError}</p> : null}
      </section>

      <section className="x402-panel">
        <div>
          <div className="section-title">
            <KeyRound size={20} />
            <h2>x402 API check</h2>
          </div>
          <p>
            Local server returns HTTP 402 on the protected route. Sepolia test payment can be
            completed later with a compatible x402 buyer client.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={checkX402} disabled={apiLoading}>
          {apiLoading ? <Loader2 className="spin" size={18} /> : <KeyRound size={18} />}
          Check route
        </button>
        {apiResult ? (
          <pre className="api-result">{JSON.stringify(apiResult, null, 2)}</pre>
        ) : null}
      </section>

      <section className="agent-panel">
        <div>
          <div className="section-title">
            <ShieldCheck size={20} />
            <h2>ERC-8004 Agent</h2>
          </div>
          <p>
            Register the x402 service as an onchain agent identity owned by the connected wallet.
          </p>
          <div className="agent-details">
            <span>Registry: {compact(agentRegistryAddress)}</span>
            <span>Identity count: {agentIdentityCount}</span>
            <a href={agentRegistrationUri} target="_blank" rel="noreferrer">
              Agent metadata <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <button
          className="secondary-button"
          type="button"
          disabled={
            !agentRegistryAddress ||
            !isConnected ||
            !isCorrectChain ||
            hasAgentIdentity ||
            isRegisteringAgent ||
            isAgentConfirming
          }
          onClick={registerAgentIdentity}
        >
          {isRegisteringAgent || isAgentConfirming ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
          {hasAgentIdentity || isAgentRegistered ? 'Registered' : isAgentConfirming ? 'Registering' : 'Register agent'}
        </button>
        {agentHash ? (
          <a className="tx-link" href={`${explorer}/tx/${agentHash}`} target="_blank" rel="noreferrer">
            View agent transaction <ExternalLink size={15} />
          </a>
        ) : null}
        {isAgentRegistered ? <p className="success-copy">ERC-8004 agent identity registered.</p> : null}
      </section>
    </main>
  )
}

export default App
