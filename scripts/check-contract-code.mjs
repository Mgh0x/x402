import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const address = process.argv[2] || '0x8238e860f836627D62fC1de4D3EB9030446A4D84'
const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') })

const code = await client.getCode({ address })
console.log(JSON.stringify({ address, hasCode: Boolean(code && code !== '0x'), codeLength: code?.length || 0 }, null, 2))
