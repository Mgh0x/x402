# CREATE2 Deploy Path

Some wallet providers can fail on direct contract creation transactions. The app uses a CREATE2 factory path as a compatibility layer.

## Factory

`0x4e59b44847b379578588920cA78FbF26c0B4956C`

The browser wallet sends a normal transaction to the factory. The factory deploys the guestbook bytecode deterministically with CREATE2.
