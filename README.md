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
- CREATE2 factory deployment path for wallet compatibility.
- x402-protected API route for agent/payment experimentation.
- Base Dashboard-ready project metadata, contract links, and app surface.

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
npm run x402
```

## Environment

`.env.example` targets Base mainnet by default. `.env.sepolia` is included as a reference for the testnet deployment.

Never commit a real deployer private key. The app deploy flow uses the connected browser wallet instead.
