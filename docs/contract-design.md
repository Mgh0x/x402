# Contract Design

`BasedGuestbook` keeps the contract intentionally small:

- `sign(string message)` writes an entry.
- `entriesCount()` returns the number of entries.
- `getRecentEntries(uint256 limit)` returns recent entries for UI reads.

Messages are capped at 180 bytes.
