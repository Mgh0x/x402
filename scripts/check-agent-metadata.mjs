import { readFileSync } from 'node:fs'

const expectedWallet = '0x85Ea474FfAF21e45ce88185869F13432F92956c3'
const expectedBuilderCode = 'bc_245mi40p'
const expectedOrigin = 'https://based-guestbook-x402.vercel.app'

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const registration = readJson('public/agent.json')
const agentCard = readJson('public/.well-known/agent-card.json')
const wellKnownRegistration = readJson('public/.well-known/agent-registration.json')

assert(registration.type === 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1', 'agent.json has an invalid ERC-8004 type')
assert(registration.name === 'Based Guestbook x402 Agent', 'agent.json name mismatch')
assert(registration.x402Support === true, 'agent.json must advertise x402 support')
assert(registration.active === true, 'agent.json must be active')
assert(Array.isArray(registration.services) && registration.services.length >= 2, 'agent.json must include services')
assert(registration.services.some((service) => service.name === 'x402'), 'agent.json must include an x402 service')
assert(registration.builder?.builderCode === expectedBuilderCode, 'agent.json builder code mismatch')
assert(registration.builder?.builderWallet === expectedWallet, 'agent.json builder wallet mismatch')
assert(registration.services.every((service) => service.endpoint.startsWith(expectedOrigin) || service.endpoint.startsWith('https://github.com/')), 'agent.json contains an unexpected service origin')

assert(agentCard.capabilities?.x402 === true, 'agent-card must advertise x402')
assert(agentCard.capabilities?.erc8004 === true, 'agent-card must advertise ERC-8004')
assert(agentCard.metadata?.builderCode === expectedBuilderCode, 'agent-card builder code mismatch')
assert(agentCard.metadata?.wallet === expectedWallet, 'agent-card wallet mismatch')
assert(agentCard.metadata?.registrationFile === `${expectedOrigin}/agent.json`, 'agent-card registrationFile mismatch')

assert(wellKnownRegistration.type === registration.type, 'well-known registration type mismatch')
assert(wellKnownRegistration.x402Support === true, 'well-known registration must advertise x402 support')

console.log('ERC-8004 agent metadata checks passed')
