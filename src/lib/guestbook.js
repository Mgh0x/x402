import { parseAbi } from 'viem'
import artifact from '../../artifacts/contracts/BasedGuestbook.sol/BasedGuestbook.json'

export const guestbookAddress = import.meta.env.VITE_GUESTBOOK_ADDRESS
export const guestbookBytecode = artifact.bytecode

export const guestbookAbi = parseAbi([
  'event EntrySigned(address indexed author, string message, uint256 timestamp)',
  'function sign(string calldata message) external',
  'function entriesCount() external view returns (uint256)',
  'function getRecentEntries(uint256 limit) external view returns ((address author,string message,uint256 timestamp)[])',
])
