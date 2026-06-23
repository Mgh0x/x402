import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const wallet = "0x85Ea474FfAF21e45ce88185869F13432F92956c3";
const contract = "0x8238e860f836627D62fC1de4D3EB9030446A4D84";
const repo = "https://github.com/Mgh0x/x402";

const topics = [
  ["wallet-connect", "Wallet connection", "Confirm the connected wallet, active chain, and balance before contract calls."],
  ["base-mainnet", "Base mainnet", "Keep Base mainnet as the primary public proof network for the application."],
  ["base-sepolia", "Base Sepolia", "Use Base Sepolia for low-risk iteration before pushing mainnet changes."],
  ["guestbook-write", "Guestbook write", "Record short onchain messages through the deployed guestbook contract."],
  ["guestbook-read", "Guestbook read", "Fetch recent entries and show wallet, message, and timestamp fields clearly."],
  ["x402-health", "x402 health", "Keep the x402 service checkable through a public health endpoint."],
  ["x402-protected", "x402 protected route", "Document the protected endpoint so payment-gated access is easy to test."],
  ["metadata", "Project metadata", "Store contract addresses, transaction hashes, and project links in tracked metadata files."],
  ["explorer-links", "Explorer links", "Make BaseScan transaction and address links easy to find from the repo."],
  ["frontend-state", "Frontend state", "Surface connection, chain, balance, transaction, and error states in the UI."],
  ["error-copy", "Error copy", "Prefer short user-facing messages while keeping debug details available."],
  ["contract-events", "Contract events", "Use emitted events as a durable activity trail for the guestbook."],
  ["manual-qa", "Manual QA", "Keep a repeatable manual checklist for wallet and network testing."],
  ["deployment", "Deployment", "Track deployment environment variables and expected network values."],
  ["security", "Security", "Avoid committing private keys, wallet secrets, RPC tokens, or production-only credentials."],
  ["gas-check", "Gas check", "Keep interaction costs visible so mainnet use stays predictable."],
  ["public-profile", "Public profile", "Make the repo readable for reviewers checking public builder activity."],
  ["release-notes", "Release notes", "Summarize the visible change, proof transaction, and verification command for releases."],
  ["maintenance", "Maintenance", "Write down recurring checks so the app stays usable after dependency updates."],
  ["roadmap", "Roadmap", "Keep next improvements scoped around Base, x402, and public proof quality."],
  ["verification", "Verification", "List the exact commands used to verify the current app state."],
  ["architecture", "Architecture", "Explain how React, wagmi, viem, Hardhat, Express, and x402 fit together."],
  ["abi", "ABI tracking", "Keep contract ABI references aligned with the deployed guestbook behavior."],
  ["network-switch", "Network switch", "Make expected chain IDs explicit for Base and Base Sepolia."],
  ["transaction-history", "Transaction history", "Track successful public transactions separately from local test attempts."],
  ["documentation", "Documentation", "Prefer small focused docs so reviewers can scan project intent quickly."],
  ["contribution", "Contribution", "Document how future contributors can run, test, and verify the project."],
  ["local-dev", "Local dev", "Keep local start commands and required ports in one predictable place."],
  ["contract-code", "Contract code", "Add code-check scripts to verify a deployed address has bytecode."],
  ["entry-reader", "Entry reader", "Provide a script for reading guestbook entries from the configured contract."],
  ["payment-flow", "Payment flow", "Describe where x402 payment-gated API behavior belongs in the project."],
  ["base-builder", "Base builder", "Keep public evidence focused on real Base transactions and shipped code."],
  ["ui-layout", "UI layout", "Keep the dashboard compact, readable, and useful for repeated checks."],
  ["accessibility", "Accessibility", "Use clear labels, visible focus states, and readable status text."],
  ["config-reference", "Config reference", "Document environment variables and their expected mainnet/testnet values."],
  ["failure-cases", "Failure cases", "Capture common wallet, RPC, and chain mismatch issues with fixes."],
  ["review-readiness", "Review readiness", "Make the repo easy to inspect without needing private context."],
  ["basehub-note", "BaseHub note", "Reserve a place to connect BaseHub/profile tasks to the project evidence."],
  ["builder-journal", "Builder journal", "Keep short dated notes for public development continuity."],
  ["contract-proof", "Contract proof", "Tie contract address, explorer link, and proof transactions together."],
  ["open-source", "Open source", "Keep public commits descriptive and tied to a clear project artifact."],
  ["env-safety", "Environment safety", "Track public examples separately from private local .env files."],
  ["debugging", "Debugging", "Record fixes for wallet-provider and transaction execution problems."],
  ["test-plan", "Test plan", "Document the minimum checks before and after each onchain change."],
  ["data-shape", "Data shape", "Show the expected guestbook entry fields and frontend rendering shape."],
  ["base-dashboard", "Base dashboard", "Prepare concise submission notes for Base dashboard style checks."],
  ["x402-readme", "x402 README", "Keep x402 usage understandable for someone opening the repo cold."],
  ["final-check", "Final check", "Keep a final checklist for public commit, build, and push verification."],
  ["next-proof", "Next proof", "List future proof actions that can strengthen the wallet profile."],
];

const write = (file, body) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body);
};

const run = (command, args) => {
  execFileSync(command, args, { stdio: "inherit" });
};

topics.forEach(([slug, title, focus], index) => {
  const number = String(index + 1).padStart(2, "0");
  const file = `docs/builder-log/${number}-${slug}.md`;
  const body = `# ${title}

## Focus
${focus}

## Public proof context
- Repository: ${repo}
- Builder wallet: ${wallet}
- Base mainnet guestbook: ${contract}

## Check
This note is part of the public builder trail for the Base guestbook and x402 project. It keeps the work easy to audit without relying on private notes or private repository activity.

## Next action
Use this topic as a checkpoint when improving the app, verifying a transaction, or updating Base/x402 profile tasks.
`;

  write(file, body);
  run("git", ["add", file]);
  run("git", ["commit", "-m", `Add ${title.toLowerCase()} builder note`]);
});
