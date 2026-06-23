# Event Indexing

The contract emits:

```solidity
event EntrySigned(address indexed author, string message, uint256 timestamp);
```

The indexed author field lets explorers and scripts filter entries from a specific wallet.
