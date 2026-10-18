# Lobby friend chat

Chat opens inside the existing Friends drawer via the speech-bubble button beside Invite. It supports accepted friends only, offline recipients, local-time timestamps and calendar date separators (Today, Yesterday, date), unread badges, older-message pagination, pending status, and retry using the same idempotent message ID.

## Table restriction

The table Friends drawer has no chat entry point, unread chat badge or conversation. Moving to the table immediately unmounts an open conversation. The server independently checks the current room membership of both participants before any chat history, send or read action, including waiting/private rooms and stale presence leases. A lobby player cannot use chat to send messages to a seated partner. Existing emotes remain unchanged.

## Architecture

- Existing authenticated identities/device leases and social coordinator; no new Durable Object binding.
- POST /api/friends/chat/messages, /send, /read. Server derives the sender and timestamps.
- D1 friend_messages and friend_chat_reads; migration 0003_friend_chat.sql also included in schema.sql. Missing chat tables initialize on first use.
- Existing authenticated social WebSocket sends invalidation events containing peer ID only. Clients fetch authorized content and poll while the conversation is open to recover missed updates. Messages never appear in an invitation or table notification.
- Sequence-based pagination, fifty messages per page; idempotent sends; read positions monotonic and limited to the reader's own incoming conversation.
- Plain text, 500 characters/message; 30 new messages/minute and 500/day per sender. Duplicate retries do not consume another message or notification. No attachments or rich HTML rendering; URLs remain plain text without previews.
- Removing a friendship blocks further sends/reads and removes its unread badge. Re-accepting a friendship restores its stored conversation. Deleted accounts cannot use chat.
- Reports remain available through existing friend options; chat does not create a separate moderation interface.

## Checks

62 focused checks passed across chat, profile feedback, friend actions, invitation admission, room lifecycle and session routes. Frontend and Worker type checks passed. New checks cover identity forgery, nonfriends, duplicates, private unread counts, message limits, history pagination, both-party table blocking, stale presence, chat resuming after leaving, local dates, send timestamps, and immediately hiding an open chat when entering a table. These are server simulations and rendered UI checks, not a physical-phone or live-chat delivery claim.
