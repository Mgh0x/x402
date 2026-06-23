// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BasedGuestbook {
    struct Entry {
        address author;
        string message;
        uint256 timestamp;
    }

    Entry[] private entries;

    event EntrySigned(address indexed author, string message, uint256 timestamp);

    function sign(string calldata message) external {
        bytes calldata raw = bytes(message);
        require(raw.length > 0, "Message required");
        require(raw.length <= 180, "Message too long");

        entries.push(Entry({
            author: msg.sender,
            message: message,
            timestamp: block.timestamp
        }));

        emit EntrySigned(msg.sender, message, block.timestamp);
    }

    function entriesCount() external view returns (uint256) {
        return entries.length;
    }

    function getRecentEntries(uint256 limit) external view returns (Entry[] memory) {
        uint256 total = entries.length;
        uint256 size = limit < total ? limit : total;
        Entry[] memory recent = new Entry[](size);

        for (uint256 i = 0; i < size; i++) {
            recent[i] = entries[total - size + i];
        }

        return recent;
    }
}
