# Based Guestbook + x402

Small Base builder project: an onchain guestbook plus a payment-gated x402 API demo.

## Live Contracts

- Base mainnet guestbook: [`0x8238e860f836627D62fC1de4D3EB9030446A4D84`](https://basescan.org/address/0x8238e860f836627D62fC1de4D3EB9030446A4D84)
- Base Sepolia guestbook: [`0x869af44727d57085bc46aed7d4bd90333ae68534`](https://sepolia.basescan.org/address/0x869af44727d57085bc46aed7d4bd90333ae68534)

## Mainnet Proof

- [`Building on Base with x402.`](https://basescan.org/tx/0x5bbac0c704a4f222a8666660966b7b82c25c88457a5d8f6d8d09256d4d32ca6e)
- [`BASED`](https://basescan.org/tx/0xc42cae8cf09fd5e6d2e9f080e06a9d8155370acabf0ad9c7dd82882b01c2f6a9)

## Features

- Wallet connect for Base and Base Sepolia.
- Onchain guestbook contract with recent entry reads.
- ERC-8021 Builder Code attribution on guestbook writes.
- CREATE2 factory deployment path for wallet compatibility.
- x402-protected API route with Builder Code metadata for agent/payment experimentation.
- Base Dashboard-ready project metadata, contract links, and app surface.

## Builder Code Attribution

- Builder Code: `bc_245mi40p`
- Encoded suffix: `0x62635f3234356d693430700b0080218021802180218021802180218021`

Guestbook write transactions append the Builder Code suffix through viem/wagmi `dataSuffix` so Base Dashboard can attribute onchain activity to this app.

The x402 protected route also declares the same Builder Code in its route extensions so paid endpoint activity can be attributed to this app when x402 payments settle on Base.

## x402 Route

- Local route: `http://127.0.0.1:4021/api/base-signal`
- Public route: `https://based-guestbook-x402.vercel.app/api/base-signal`
- Builder Code extension: `bc_245mi40p`

The default x402 configuration uses Base Sepolia (`eip155:84532`) because the free `https://x402.org/facilitator` is testnet-only. For Base mainnet x402 payments (`eip155:8453`), use a production CDP facilitator before changing `X402_NETWORK`.

## ERC-8004 Agent Metadata

- Registration file: `https://based-guestbook-x402.vercel.app/agent.json`
- Agent card: `https://based-guestbook-x402.vercel.app/.well-known/agent-card.json`
- Domain helper: `https://based-guestbook-x402.vercel.app/.well-known/agent-registration.json`
- Intended agent wallet: `0x85Ea474FfAF21e45ce88185869F13432F92956c3`

The metadata prepares this project for ERC-8004 agent registration on Base. After an onchain agent identity is minted, update the `registrations` arrays with the registry address and agent ID.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
npm run x402
```

Open `http://127.0.0.1:5173`.

## Commands

```bash
npm run build
npm run lint
npm run compile
npm run agent:check
npm run x402
```

## Environment

`.env.example` targets Base mainnet by default. `.env.sepolia` is included as a reference for the testnet deployment.

Never commit a real deployer private key. The app deploy flow uses the connected browser wallet instead.
