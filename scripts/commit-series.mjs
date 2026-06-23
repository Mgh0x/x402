import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = process.cwd()

const entries = [
  {
    file: 'docs/overview.md',
    message: 'Document project overview',
    body: `# Project Overview

Based Guestbook + x402 is a small Base builder project. It combines a simple onchain guestbook with an x402-protected API route so the project has both social contract interaction and agent-payment surface area.

## Goals

- Keep the app simple enough to audit.
- Show live Base mainnet contract usage.
- Keep testnet and mainnet deployment notes separate.
- Prepare clear metadata for Base Dashboard and public review.
`,
  },
  {
    file: 'docs/contracts.md',
    message: 'Document contract addresses',
    body: `# Contracts

## Base Mainnet

- Guestbook: \`0x8238e860f836627D62fC1de4D3EB9030446A4D84\`
- Explorer: https://basescan.org/address/0x8238e860f836627D62fC1de4D3EB9030446A4D84

## Base Sepolia

- Guestbook: \`0x869af44727d57085bc46aed7d4bd90333ae68534\`
- Explorer: https://sepolia.basescan.org/address/0x869af44727d57085bc46aed7d4bd90333ae68534
`,
  },
  {
    file: 'docs/mainnet-proof.md',
    message: 'Add mainnet proof notes',
    body: `# Mainnet Proof

The mainnet contract has confirmed guestbook entries from the builder wallet.

## Transactions

- Building on Base with x402: https://basescan.org/tx/0x5bbac0c704a4f222a8666660966b7b82c25c88457a5d8f6d8d09256d4d32ca6e
- BASED: https://basescan.org/tx/0xc42cae8cf09fd5e6d2e9f080e06a9d8155370acabf0ad9c7dd82882b01c2f6a9
`,
  },
  {
    file: 'docs/sepolia-proof.md',
    message: 'Add Sepolia proof notes',
    body: `# Sepolia Proof

Sepolia was used as the dry run before moving the app to Base mainnet.

## Contract

\`0x869af44727d57085bc46aed7d4bd90333ae68534\`

## Notes

- Deployment was completed before mainnet.
- Multiple guestbook entries were written through the UI.
- This reduced mainnet deployment risk.
`,
  },
  {
    file: 'docs/base-dashboard.md',
    message: 'Add Base Dashboard metadata draft',
    body: `# Base Dashboard Draft

## App Name

Based Guestbook x402

## Short Description

An onchain Base guestbook with a payment-gated x402 API demo.

## Long Description

Based Guestbook x402 is a lightweight Base app that lets connected wallets write short public messages to a guestbook contract. It also includes a small x402-protected API route to explore agent-payment flows on Base.

## Category

Developer tool, social, payments
`,
  },
  {
    file: 'docs/vercel-deploy.md',
    message: 'Document Vercel deployment settings',
    body: `# Vercel Deployment

## Project

Import \`Mgh0x/x402\` from GitHub.

## Build Settings

- Framework: Vite
- Build command: \`npm run build\`
- Output directory: \`dist\`

## Environment Variables

- \`VITE_TARGET_CHAIN=base\`
- \`VITE_GUESTBOOK_ADDRESS=0x8238e860f836627D62fC1de4D3EB9030446A4D84\`
- \`X402_PAY_TO=0x85Ea474FfAF21e45ce88185869F13432F92956c3\`
- \`X402_NETWORK=eip155:8453\`
`,
  },
  {
    file: 'docs/x402.md',
    message: 'Document x402 route',
    body: `# x402 Route

The local server exposes a protected route:

\`\`\`
GET /api/base-signal
\`\`\`

Without a valid x402 payment, the route returns HTTP 402. After payment, it returns a JSON builder signal payload.

## Local Commands

\`\`\`bash
npm run x402
curl http://127.0.0.1:4021/api/health
\`\`\`
`,
  },
  {
    file: 'docs/security.md',
    message: 'Add wallet security notes',
    body: `# Security Notes

- Never commit a private key.
- Keep \`.env\` ignored.
- Use browser wallet signing for deploys.
- Revoke risky token approvals after experiments.
- Avoid interacting with spam tokens received by a wallet.
- Verify Base URLs before connecting a wallet.
`,
  },
  {
    file: 'docs/local-development.md',
    message: 'Document local development flow',
    body: `# Local Development

Run the frontend:

\`\`\`bash
npm run dev
\`\`\`

Run the x402 server:

\`\`\`bash
npm run x402
\`\`\`

Compile contracts:

\`\`\`bash
npm run compile
\`\`\`
`,
  },
  {
    file: 'docs/create2-deploy.md',
    message: 'Explain CREATE2 deploy path',
    body: `# CREATE2 Deploy Path

Some wallet providers can fail on direct contract creation transactions. The app uses a CREATE2 factory path as a compatibility layer.

## Factory

\`0x4e59b44847b379578588920cA78FbF26c0B4956C\`

The browser wallet sends a normal transaction to the factory. The factory deploys the guestbook bytecode deterministically with CREATE2.
`,
  },
  {
    file: 'docs/interaction-guide.md',
    message: 'Add interaction guide',
    body: `# Interaction Guide

1. Open the app.
2. Connect a Base wallet.
3. Confirm the network pill shows Base.
4. Write a short message.
5. Press Sign Guestbook.
6. Confirm in the wallet.
7. Open the transaction link after confirmation.
`,
  },
  {
    file: 'docs/troubleshooting.md',
    message: 'Add troubleshooting notes',
    body: `# Troubleshooting

## Wrong Network

Switch the wallet to Base or Base Sepolia depending on the active environment.

## Contract Missing

Check \`VITE_GUESTBOOK_ADDRESS\` in the environment.

## x402 Returns 402

That is expected when no payment header is attached.
`,
  },
  {
    file: 'docs/release-checklist.md',
    message: 'Add release checklist',
    body: `# Release Checklist

- Build passes.
- Lint passes.
- Contract address is set.
- Mainnet explorer links work.
- README has current transaction proof.
- \`.env\` is not tracked.
- Base Dashboard copy is prepared.
`,
  },
  {
    file: 'docs/dashboard-copy.md',
    message: 'Add dashboard copy',
    body: `# Dashboard Copy

## Tagline

Write a short public message on Base and test an x402-protected API route.

## Details

This project demonstrates a simple Base guestbook contract and a payment-gated API surface for x402 agent payment experiments.
`,
  },
  {
    file: 'metadata/base-dashboard.json',
    message: 'Add Base Dashboard JSON metadata',
    body: `{
  "name": "Based Guestbook x402",
  "description": "An onchain Base guestbook with a payment-gated x402 API demo.",
  "category": ["developer-tool", "social", "payments"],
  "chain": "base",
  "contract": "0x8238e860f836627D62fC1de4D3EB9030446A4D84",
  "builderWallet": "0x85Ea474FfAF21e45ce88185869F13432F92956c3"
}
`,
  },
  {
    file: 'metadata/contracts.json',
    message: 'Add contracts metadata',
    body: `{
  "base": {
    "guestbook": "0x8238e860f836627D62fC1de4D3EB9030446A4D84",
    "explorer": "https://basescan.org/address/0x8238e860f836627D62fC1de4D3EB9030446A4D84"
  },
  "baseSepolia": {
    "guestbook": "0x869af44727d57085bc46aed7d4bd90333ae68534",
    "explorer": "https://sepolia.basescan.org/address/0x869af44727d57085bc46aed7d4bd90333ae68534"
  }
}
`,
  },
  {
    file: 'metadata/transactions.json',
    message: 'Add transaction metadata',
    body: `{
  "base": [
    {
      "message": "Building on Base with x402.",
      "tx": "0x5bbac0c704a4f222a8666660966b7b82c25c88457a5d8f6d8d09256d4d32ca6e"
    },
    {
      "message": "BASED",
      "tx": "0xc42cae8cf09fd5e6d2e9f080e06a9d8155370acabf0ad9c7dd82882b01c2f6a9"
    }
  ]
}
`,
  },
  {
    file: 'metadata/vercel-env.example',
    message: 'Add Vercel environment example',
    body: `VITE_TARGET_CHAIN=base
VITE_GUESTBOOK_ADDRESS=0x8238e860f836627D62fC1de4D3EB9030446A4D84
X402_PAY_TO=0x85Ea474FfAF21e45ce88185869F13432F92956c3
X402_NETWORK=eip155:8453
`,
  },
  {
    file: 'scripts/check-contract-code.mjs',
    message: 'Add contract code checker',
    body: `import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const address = process.argv[2] || '0x8238e860f836627D62fC1de4D3EB9030446A4D84'
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const code = await client.getCode({ address })
console.log(JSON.stringify({ address, hasCode: Boolean(code && code !== '0x'), codeLength: code?.length || 0 }, null, 2))
`,
  },
  {
    file: 'scripts/read-entries.mjs',
    message: 'Add entry reader script',
    body: `import { createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'

const address = process.argv[2] || '0x8238e860f836627D62fC1de4D3EB9030446A4D84'
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })
const abi = parseAbi(['function getRecentEntries(uint256 limit) view returns ((address author,string message,uint256 timestamp)[])'])

const entries = await client.readContract({ address, abi, functionName: 'getRecentEntries', args: [5n] })
console.log(JSON.stringify(entries.map((entry) => ({
  author: entry.author,
  message: entry.message,
  timestamp: new Date(Number(entry.timestamp) * 1000).toISOString(),
})), null, 2))
`,
  },
  {
    file: 'scripts/check-x402-health.mjs',
    message: 'Add x402 health checker',
    body: `const url = process.argv[2] || 'http://127.0.0.1:4021/api/health'
const response = await fetch(url)
const body = await response.json()
console.log(JSON.stringify({ status: response.status, body }, null, 2))
`,
  },
  {
    file: 'scripts/check-x402-protected.mjs',
    message: 'Add x402 protected route checker',
    body: `const url = process.argv[2] || 'http://127.0.0.1:4021/api/base-signal'
const response = await fetch(url)
const body = await response.text()
console.log(JSON.stringify({ status: response.status, paymentRequired: response.status === 402, body }, null, 2))
`,
  },
  {
    file: 'docs/scripts.md',
    message: 'Document helper scripts',
    body: `# Helper Scripts

- \`scripts/check-contract-code.mjs\`: checks whether a contract has bytecode.
- \`scripts/read-entries.mjs\`: reads recent guestbook entries.
- \`scripts/check-x402-health.mjs\`: checks the local x402 health route.
- \`scripts/check-x402-protected.mjs\`: confirms the protected route returns HTTP 402 without payment.
`,
  },
  {
    file: 'docs/architecture.md',
    message: 'Document architecture',
    body: `# Architecture

## Frontend

React, Vite, wagmi, viem, and lucide-react.

## Contract

The guestbook contract stores short messages and emits an \`EntrySigned\` event.

## Server

The Express server exposes a health route and an x402-protected route.
`,
  },
  {
    file: 'docs/frontend.md',
    message: 'Document frontend structure',
    body: `# Frontend Structure

- \`src/App.jsx\`: app shell, wallet flow, guestbook read/write, x402 check.
- \`src/App.css\`: responsive product styling.
- \`src/lib/guestbook.js\`: ABI, bytecode, and configured contract address.
- \`src/main.jsx\`: wagmi and React Query providers.
`,
  },
  {
    file: 'docs/contract-design.md',
    message: 'Document contract design',
    body: `# Contract Design

\`BasedGuestbook\` keeps the contract intentionally small:

- \`sign(string message)\` writes an entry.
- \`entriesCount()\` returns the number of entries.
- \`getRecentEntries(uint256 limit)\` returns recent entries for UI reads.

Messages are capped at 180 bytes.
`,
  },
  {
    file: 'docs/event-indexing.md',
    message: 'Add event indexing notes',
    body: `# Event Indexing

The contract emits:

\`\`\`solidity
event EntrySigned(address indexed author, string message, uint256 timestamp);
\`\`\`

The indexed author field lets explorers and scripts filter entries from a specific wallet.
`,
  },
  {
    file: 'docs/wallet-support.md',
    message: 'Add wallet support notes',
    body: `# Wallet Support

The app exposes injected wallet connectors for common browser wallets.

Direct contract deployment can fail in some provider paths. The CREATE2 factory route keeps deployment as a normal contract interaction and improves wallet compatibility.
`,
  },
  {
    file: 'docs/network-config.md',
    message: 'Document network config',
    body: `# Network Config

The app switches between Base and Base Sepolia through:

\`\`\`
VITE_TARGET_CHAIN=base
\`\`\`

Supported values:

- \`base\`
- \`baseSepolia\`
`,
  },
  {
    file: 'docs/base-app-checklist.md',
    message: 'Add Base app checklist',
    body: `# Base App Checklist

- Public GitHub repository.
- Mainnet contract address.
- Public app URL.
- Screenshot of the running app.
- Short description.
- Contract interaction proof.
- x402 endpoint notes.
`,
  },
  {
    file: 'docs/maintenance.md',
    message: 'Add maintenance notes',
    body: `# Maintenance

Keep contract addresses current in:

- \`.env.example\`
- \`README.md\`
- \`metadata/contracts.json\`
- Base Dashboard submission copy

Run build and lint before pushing changes.
`,
  },
  {
    file: 'docs/contributing.md',
    message: 'Add contributing notes',
    body: `# Contributing

Small focused changes are preferred.

Before submitting changes:

1. Run \`npm run lint\`.
2. Run \`npm run build\`.
3. Update docs when contract addresses or routes change.
`,
  },
  {
    file: 'docs/roadmap.md',
    message: 'Add project roadmap',
    body: `# Roadmap

- Deploy public frontend.
- Add Base Dashboard listing.
- Add paid x402 client flow.
- Add screenshots to documentation.
- Add optional contract verification notes.
- Add lightweight analytics for app usage.
`,
  },
  {
    file: 'docs/verification.md',
    message: 'Add verification workflow',
    body: `# Verification Workflow

## Local

- \`npm run lint\`
- \`npm run build\`
- \`npm run compile\`

## Onchain

- Check contract bytecode.
- Read recent entries.
- Confirm transaction links resolve on BaseScan.
`,
  },
  {
    file: 'docs/base-dashboard-submission.md',
    message: 'Add dashboard submission draft',
    body: `# Base Dashboard Submission

## Name

Based Guestbook x402

## Website

To be filled after deployment.

## GitHub

https://github.com/Mgh0x/x402

## Contract

https://basescan.org/address/0x8238e860f836627D62fC1de4D3EB9030446A4D84
`,
  },
  {
    file: 'docs/deploy-history.md',
    message: 'Add deploy history',
    body: `# Deploy History

## Base Sepolia

The Sepolia deployment validated the contract and UI flow before mainnet.

## Base Mainnet

The mainnet deployment is live and has confirmed guestbook entries from the builder wallet.
`,
  },
  {
    file: 'docs/faq.md',
    message: 'Add FAQ',
    body: `# FAQ

## Why x402?

x402 is a payment protocol pattern for HTTP 402 payment-required flows. It fits agent and API payment experiments.

## Why a guestbook?

A guestbook is simple, auditable, and produces clear wallet-to-contract interaction proof.
`,
  },
  {
    file: 'docs/api.md',
    message: 'Document API routes',
    body: `# API Routes

## GET /api/health

Returns server status.

## GET /api/base-signal

Protected by x402 payment middleware. Without payment, the expected response is HTTP 402.
`,
  },
  {
    file: 'docs/ux-notes.md',
    message: 'Add UX notes',
    body: `# UX Notes

The app keeps the primary action visible:

- Connect wallet.
- Switch to the target network.
- Write a guestbook message.
- Check the x402 protected route.

The interface avoids hiding contract state behind extra navigation.
`,
  },
  {
    file: 'docs/gas-notes.md',
    message: 'Add gas notes',
    body: `# Gas Notes

The guestbook contract is intentionally small. Message writes cost more than a plain transfer because they store text onchain.

Keep messages short and avoid repeated unnecessary writes on mainnet.
`,
  },
  {
    file: 'docs/environment-reference.md',
    message: 'Add environment reference',
    body: `# Environment Reference

- \`VITE_TARGET_CHAIN\`: selects Base or Base Sepolia.
- \`VITE_GUESTBOOK_ADDRESS\`: active guestbook contract.
- \`X402_PAY_TO\`: recipient wallet for x402 payments.
- \`X402_NETWORK\`: CAIP-2 network identifier.
- \`X402_FACILITATOR_URL\`: x402 facilitator URL.
`,
  },
  {
    file: 'docs/base-scan-links.md',
    message: 'Add explorer links',
    body: `# Explorer Links

- Mainnet contract: https://basescan.org/address/0x8238e860f836627D62fC1de4D3EB9030446A4D84
- Sepolia contract: https://sepolia.basescan.org/address/0x869af44727d57085bc46aed7d4bd90333ae68534
- Builder wallet: https://basescan.org/address/0x85Ea474FfAF21e45ce88185869F13432F92956c3
`,
  },
  {
    file: 'docs/public-profile.md',
    message: 'Add public profile notes',
    body: `# Public Profile Notes

This repository is public so the project can be reviewed by users and Base ecosystem tools.

Public commits, public contract links, and public transaction proof make the builder activity easier to verify.
`,
  },
  {
    file: 'docs/base-builder-signal.md',
    message: 'Document builder signal',
    body: `# Base Builder Signal

The project creates several public signals:

- Public GitHub repository.
- Base mainnet contract.
- Wallet-originated guestbook entries.
- x402 protected API route.
- Dashboard-ready metadata.
`,
  },
  {
    file: 'docs/manual-qa.md',
    message: 'Add manual QA checklist',
    body: `# Manual QA

1. Open the app.
2. Confirm the network pill says Base.
3. Connect wallet.
4. Read recent entries.
5. Submit a short message.
6. Open the transaction link.
7. Check x402 route response.
`,
  },
  {
    file: 'docs/known-limitations.md',
    message: 'Add known limitations',
    body: `# Known Limitations

- The x402 paid client flow is not yet implemented in the frontend.
- Contract verification is documented but not automated.
- The app currently reads a fixed number of recent entries.
- No moderation is included for guestbook messages.
`,
  },
  {
    file: 'docs/next-steps.md',
    message: 'Add next steps',
    body: `# Next Steps

- Deploy the frontend publicly.
- Submit Base Dashboard metadata.
- Add screenshot assets to docs.
- Add an x402 paid client demo.
- Add contract verification instructions.
`,
  },
  {
    file: 'metadata/project-links.json',
    message: 'Add project links metadata',
    body: `{
  "repository": "https://github.com/Mgh0x/x402",
  "baseContract": "https://basescan.org/address/0x8238e860f836627D62fC1de4D3EB9030446A4D84",
  "builderWallet": "https://basescan.org/address/0x85Ea474FfAF21e45ce88185869F13432F92956c3"
}
`,
  },
  {
    file: 'docs/commit-plan.md',
    message: 'Add commit plan notes',
    body: `# Commit Plan

This repository uses small public commits for readable project history.

The goal is to keep commits meaningful:

- One topic per commit.
- Documentation close to implementation.
- Public metadata for public review.
- No private keys or local secrets.
`,
  },
]

function git(args) {
  return execFileSync('git', args, { cwd: root, stdio: 'inherit' })
}

for (const entry of entries) {
  const filePath = join(root, entry.file)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, entry.body)
  git(['add', entry.file])
  git(['commit', '-m', entry.message])
}
