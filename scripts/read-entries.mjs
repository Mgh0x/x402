import { createPublicClient, http, parseAbi } from 'viem'
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
