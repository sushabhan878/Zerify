# Zerify --- Real-Time Messaging & Collaboration Communication System

## Detailed Product + Technical Requirements Document (PRD/TRD)

**Product:** Zerify\
**Feature:** Messaging, Collaboration Requests, System/Instant Messages,
File Sharing\
**Version:** 1.0\
**Status:** Implementation Specification\
**Primary requirement:** Real-time messaging over WebSockets with
document/file sharing up to 25 MB.

------------------------------------------------------------------------

# 1. Overview

Zerify is a marketplace/platform where brands and influencers discover
each other, communicate, and collaborate.

The Messaging feature is the communication layer between these users. It
must support:

-   Real-time one-to-one conversations between brands and influencers.
-   Collaboration-request conversations.
-   Real-time text messaging using WebSockets.
-   File/document sharing up to **25 MB per file**.
-   Images and common business documents.
-   Upload progress and attachment previews.
-   Message delivery and read states.
-   Typing indicators.
-   Online/offline presence.
-   System-generated/instant messages for important marketplace events.
-   Notifications when a user receives a message or collaboration event.
-   Conversation history with pagination.
-   Secure authorization so users can only access conversations they
    belong to.
-   Reliable message persistence even if a WebSocket connection drops.
-   Reconnection and missed-message synchronization.

The messaging system should feel similar to modern products such as
WhatsApp, Slack, LinkedIn messaging, and marketplace communication
systems, while remaining tightly integrated with Zerify's
influencer-brand collaboration workflow.

------------------------------------------------------------------------

# 2. Core User Experience

## 2.1 Main messaging flow

``` text
Brand / Influencer
        |
        v
Messages
        |
        +-----------------------------+
        |                             |
        v                             v
Conversation List              Start Conversation
        |                             |
        v                             v
Conversation ----------------> New Chat
        |
        +--> Send Text
        |
        +--> Attach File
        |
        +--> View Collaboration Status
        |
        +--> System Messages
        |
        +--> Read/Unread
        |
        +--> Typing Indicator
        |
        +--> Online Status
```

## 2.2 Collaboration flow

Example:

``` text
Influencer discovers Brand
        |
        v
Influencer sends Collaboration Request
        |
        v
Zerify creates/updates conversation
        |
        v
System Message:
"Alex sent you a collaboration request."
        |
        v
Brand accepts request
        |
        v
System Message:
"Brand accepted your collaboration request."
        |
        v
Conversation becomes active
        |
        v
Both users can communicate
```

The system message must be persisted as a message/event in the
conversation so that it remains visible when the user opens the
conversation later.

------------------------------------------------------------------------

# 3. Goals

## 3.1 Functional goals

1.  Provide instant real-time communication.
2.  Persist every successfully sent message.
3.  Support attachments up to 25 MB.
4.  Support collaboration-specific system messages.
5.  Keep conversation state synchronized across multiple browser
    tabs/devices.
6.  Provide reliable delivery after temporary network failures.
7.  Provide unread counts.
8.  Provide read receipts.
9.  Provide typing indicators.
10. Provide online/offline presence.
11. Support conversation search and pagination.
12. Provide notification integration.
13. Prevent unauthorized conversation access.
14. Make the messaging architecture scalable.

## 3.2 Non-goals for v1

The following should not be required for the first implementation:

-   Voice calls.
-   Video calls.
-   End-to-end encryption.
-   Group chats.
-   Message reactions.
-   Message editing.
-   Message deletion for everyone.
-   Disappearing messages.
-   Large-file transfer above 25 MB.
-   Full email client functionality.

These can be introduced in later versions.

------------------------------------------------------------------------

# 4. User Roles

## 4.1 Influencer

An influencer can:

-   Start a conversation with a brand.
-   Send a collaboration request.
-   Send text messages.
-   Upload files/documents up to 25 MB.
-   Receive brand responses.
-   Receive collaboration status system messages.
-   Read messages.
-   See typing/presence states.
-   Receive notifications.

## 4.2 Brand

A brand can:

-   Start a conversation with an influencer.
-   Receive collaboration requests.
-   Accept/reject collaboration requests.
-   Send messages.
-   Upload documents.
-   Receive system messages.
-   View collaboration context.
-   Receive notifications.

## 4.3 Platform/System

Zerify itself can generate messages for marketplace events.

Examples:

-   Collaboration request created.
-   Collaboration request accepted.
-   Collaboration request rejected.
-   Collaboration request withdrawn.
-   Campaign invitation sent.
-   Campaign invitation accepted.
-   Campaign invitation declined.
-   Contract generated.
-   Contract signed.
-   Campaign started.
-   Campaign completed.
-   Payment milestone reached.

------------------------------------------------------------------------

# 5. Messaging UI

## 5.1 Message section layout

``` text
+-------------------------------------------------------------+
| Messages                                                    |
+----------------------+--------------------------------------+
| Search conversations | Conversation Header                  |
|                      | Brand Name        Online             |
| -------------------  +--------------------------------------+
| Brand A              |                                      |
| Last message...      |        Conversation                  |
| 2m              2    |                                      |
|                      |  Hi, we'd love to collaborate.       |
| Influencer B         |                                      |
| Last message...      |                 10:32 AM             |
|                      |                                      |
| Brand C              |  Sure! Please share your brief.      |
| Last message...      |                 10:34 AM             |
|                      |                                      |
|                      |  [Brand accepted your collaboration |
|                      |   request]                           |
|                      |                                      |
|                      +--------------------------------------+
|                      | [📎] [Type a message...]      [Send]|
+----------------------+--------------------------------------+
```

------------------------------------------------------------------------

# 6. Conversation Types

Every conversation should have a type.

``` text
DIRECT
COLLABORATION
CAMPAIGN
SYSTEM
```

Recommended database enum:

``` text
DIRECT
COLLABORATION
CAMPAIGN
```

System messages are messages inside these conversations rather than a
separate conversation type.

------------------------------------------------------------------------

# 7. Message Types

Every message should have a `message_type`.

``` text
TEXT
FILE
IMAGE
SYSTEM
```

Future types:

``` text
VIDEO
AUDIO
LINK
REACTION
```

------------------------------------------------------------------------

# 8. System / Instant Messages

This is a critical Zerify requirement.

System messages should be generated automatically by backend business
events.

## 8.1 Example

Influencer sends a collaboration request.

Backend event:

``` text
COLLABORATION_REQUEST_CREATED
```

Messaging service creates:

``` text
SYSTEM MESSAGE

"Rahul sent you a collaboration request."
```

Brand accepts it.

Backend event:

``` text
COLLABORATION_REQUEST_ACCEPTED
```

Messaging service creates:

``` text
SYSTEM MESSAGE

"Brand accepted your collaboration request."
```

The message should be broadcast through WebSockets immediately.

------------------------------------------------------------------------

# 9. System Event Architecture

Do not make the frontend responsible for generating system messages.

Bad:

``` text
Frontend:
"Brand accepted your collaboration request."
```

Correct:

``` text
Collaboration Service
        |
        v
Database transaction
        |
        v
Domain Event
COLLABORATION_REQUEST_ACCEPTED
        |
        v
Messaging/Event Service
        |
        v
Create SYSTEM message
        |
        v
Persist message
        |
        v
WebSocket broadcast
        |
        v
Influencer UI
```

This ensures system messages cannot be spoofed by clients.

------------------------------------------------------------------------

# 10. Recommended System Events

  -----------------------------------------------------------------------
  Event                               Generated Message
  ----------------------------------- -----------------------------------
  Collaboration request created       "\[Influencer\] sent you a
                                      collaboration request."

  Collaboration request accepted      "\[Brand\] accepted your
                                      collaboration request."

  Collaboration request rejected      "\[Brand\] declined your
                                      collaboration request."

  Request withdrawn                   "\[Influencer\] withdrew the
                                      collaboration request."

  Campaign invitation                 "\[Brand\] invited you to a
                                      campaign."

  Campaign accepted                   "\[Influencer\] accepted the
                                      campaign invitation."

  Campaign declined                   "\[Influencer\] declined the
                                      campaign invitation."

  Contract sent                       "\[Brand\] sent a contract."

  Contract signed                     "\[Influencer\] signed the
                                      contract."

  Campaign started                    "The collaboration has started."

  Campaign completed                  "The collaboration has been marked
                                      complete."
  -----------------------------------------------------------------------

The exact wording should be configurable by the backend.

------------------------------------------------------------------------

# 11. Real-Time Architecture

## 11.1 Required technology

The messaging channel must use:

**WebSockets**

Recommended implementation:

``` text
Frontend
   |
   | WebSocket
   v
WebSocket Gateway
   |
   +--> Authentication
   |
   +--> Connection Manager
   |
   +--> Message Service
   |
   +--> Presence Service
   |
   +--> Notification Service
   |
   v
Database
```

For a Node.js backend, Socket.IO or native WebSocket infrastructure can
be used.

If the existing Zerify backend already uses a real-time framework, use
that framework rather than introducing a second WebSocket stack.

------------------------------------------------------------------------

# 12. WebSocket Connection Lifecycle

## 12.1 Connect

Frontend authenticates:

``` text
Client
  |
  | WebSocket handshake + auth token
  v
WebSocket Gateway
  |
  | Validate token
  v
Connection established
```

Server should associate:

``` text
userId -> socketId(s)
```

A user may have multiple active connections:

``` text
userId
  |
  +--> Chrome
  +--> Mobile
  +--> Edge
```

Do not assume one user has only one socket.

------------------------------------------------------------------------

# 13. WebSocket Events

## Client -\> Server

``` text
conversation:join
conversation:leave
message:send
message:read
typing:start
typing:stop
presence:heartbeat
```

## Server -\> Client

``` text
conversation:joined
message:new
message:ack
message:failed
message:read
typing:start
typing:stop
presence:update
conversation:updated
notification:new
```

------------------------------------------------------------------------

# 14. Sending a Message

## 14.1 Required flow

``` text
User types:
"Hello"

        |
        v

Frontend generates temporary ID
        |
        v
message:send
        |
        v
WebSocket Gateway
        |
        v
Authenticate user
        |
        v
Validate conversation membership
        |
        v
Validate payload
        |
        v
Persist message
        |
        v
Generate server message ID
        |
        v
Broadcast message:new
        |
        +-------------> Sender
        |
        +-------------> Recipient
```

------------------------------------------------------------------------

# 15. Message Acknowledgement

Every outgoing message should have:

``` text
clientMessageId
```

Example:

``` json
{
  "clientMessageId": "tmp_8f72...",
  "conversationId": "conv_123",
  "content": "Hello!"
}
```

Server responds:

``` json
{
  "event": "message:ack",
  "clientMessageId": "tmp_8f72...",
  "messageId": "msg_456",
  "status": "SENT",
  "createdAt": "2026-09-06T10:30:00Z"
}
```

This prevents duplicate messages when the client retries.

------------------------------------------------------------------------

# 16. Idempotency

The server must enforce:

``` text
unique(conversation_id, sender_id, client_message_id)
```

If a client retries the same request:

``` text
message:send
clientMessageId = tmp_123
```

the backend must return the existing message instead of creating another
one.

------------------------------------------------------------------------

# 17. Message Delivery States

Recommended states:

``` text
SENDING
SENT
DELIVERED
READ
FAILED
```

## State flow

``` text
SENDING
   |
   v
SENT
   |
   v
DELIVERED
   |
   v
READ
```

If sending fails:

``` text
SENDING
   |
   v
FAILED
```

------------------------------------------------------------------------

# 18. Read Receipts

When the user opens a conversation, frontend should send:

``` text
message:read
```

Example:

``` json
{
  "conversationId": "conv_123",
  "lastReadMessageId": "msg_456"
}
```

Backend updates:

``` text
conversation_participant.last_read_message_id
```

Then broadcasts:

``` text
message:read
```

to the other participant.

------------------------------------------------------------------------

# 19. Unread Messages

Conversation list should display:

``` text
Brand XYZ
"Please send your media kit."
                      3
```

The unread count should be calculated efficiently.

Recommended participant fields:

``` text
last_read_message_id
unread_count
```

or derive unread counts using message sequence numbers if the
architecture requires stronger consistency.

------------------------------------------------------------------------

# 20. Typing Indicators

Typing events should not be stored as database messages.

Client:

``` text
typing:start
```

Server:

``` text
typing:start
```

Recipient sees:

``` text
Brand XYZ is typing...
```

When typing stops:

``` text
typing:stop
```

Implement debounce/throttling on the client.

Recommended behavior:

-   Start event immediately.
-   Do not send an event for every keystroke.
-   Automatically stop after \~2--3 seconds without typing.
-   Stop when message is sent.
-   Stop when conversation is closed.

------------------------------------------------------------------------

# 21. Presence

Presence should be real-time.

States:

``` text
ONLINE
AWAY
OFFLINE
```

For v1, the UI may simply show:

``` text
Online
```

or:

``` text
Last seen 5m ago
```

Presence should be stored in an ephemeral store such as Redis rather
than continuously writing heartbeat records to the main database.

------------------------------------------------------------------------

# 22. File / Document Sharing

## 22.1 Requirement

Users can attach files up to:

**25 MB per file**

The backend must validate:

``` text
file size <= 25 MB
```

Do not upload the entire file through the WebSocket connection.

WebSockets are for:

-   messaging
-   events
-   metadata
-   real-time notifications

Object storage is for:

-   files
-   documents
-   images

------------------------------------------------------------------------

# 23. Recommended File Upload Architecture

``` text
Frontend
   |
   | 1. Request upload URL
   v
Backend
   |
   | 2. Validate user + conversation + size/type
   |
   v
Object Storage
   |
   | 3. Presigned upload
   v
Frontend
   |
   | 4. Upload file directly
   v
Object Storage
   |
   | 5. Upload complete
   v
Backend
   |
   | 6. Create FILE message
   v
Database
   |
   | 7. WebSocket message:new
   v
Recipient
```

Recommended storage options:

-   AWS S3
-   Cloudflare R2
-   Google Cloud Storage
-   Azure Blob Storage

Use whichever object-storage provider is already part of Zerify's
infrastructure.

------------------------------------------------------------------------

# 24. File Upload API

## Request upload URL

``` http
POST /api/v1/conversations/{conversationId}/attachments/upload-url
```

Request:

``` json
{
  "fileName": "brand-brief.pdf",
  "contentType": "application/pdf",
  "fileSize": 2450000
}
```

Response:

``` json
{
  "uploadId": "upl_123",
  "uploadUrl": "SIGNED_UPLOAD_URL",
  "objectKey": "messages/conv_123/upl_123/brand-brief.pdf",
  "expiresAt": "2026-09-06T10:40:00Z"
}
```

------------------------------------------------------------------------

# 25. File Validation

Backend must validate:

``` text
fileSize <= 25 MB
```

Recommended MIME allowlist:

``` text
application/pdf

application/msword
application/vnd.openxmlformats-officedocument.wordprocessingml.document

application/vnd.ms-excel
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

application/vnd.ms-powerpoint
application/vnd.openxmlformats-officedocument.presentationml.presentation

image/jpeg
image/png
image/webp

text/plain
text/csv
```

The final allowlist should be configurable.

Never rely only on the filename extension. Validate the declared content
type and, where practical, inspect the actual file signature/content
type.

------------------------------------------------------------------------

# 26. Attachment Message

After upload:

``` http
POST /api/v1/conversations/{conversationId}/messages
```

or use a WebSocket message event referencing the completed upload.

Example:

``` json
{
  "clientMessageId": "tmp_file_123",
  "messageType": "FILE",
  "attachment": {
    "uploadId": "upl_123",
    "fileName": "brand-brief.pdf",
    "fileSize": 2450000,
    "mimeType": "application/pdf"
  }
}
```

Backend creates:

``` json
{
  "messageId": "msg_789",
  "messageType": "FILE",
  "attachment": {
    "fileName": "brand-brief.pdf",
    "fileSize": 2450000,
    "mimeType": "application/pdf",
    "downloadUrl": "..."
  }
}
```

------------------------------------------------------------------------

# 27. Attachment Security

Files must never be publicly accessible by default.

Use:

``` text
Private Bucket
     |
     v
Backend Authorization
     |
     v
Short-lived Signed Download URL
```

Before generating a download URL:

1.  Authenticate user.
2.  Verify conversation membership.
3.  Verify attachment belongs to that conversation.
4.  Generate short-lived URL.
5.  Return URL.

Never expose permanent public bucket URLs.

------------------------------------------------------------------------

# 28. Malware Scanning

The production system should support malware scanning.

Recommended pipeline:

``` text
Upload
  |
  v
Temporary Storage
  |
  v
Virus/Malware Scanner
  |
  +---- infected ----> QUARANTINE
  |
  +---- clean -------> AVAILABLE
```

A file should not become downloadable to other users until it passes
security checks.

------------------------------------------------------------------------

# 29. File Upload UI

Example:

``` text
+---------------------------------------+
| 📎 brand-brief.pdf                    |
| 2.4 MB                                |
| ███████████████████░░ 86%             |
+---------------------------------------+
```

States:

``` text
UPLOADING
PROCESSING
AVAILABLE
FAILED
BLOCKED
```

The user should be able to cancel an upload before completion.

------------------------------------------------------------------------

# 30. Database Model

## 30.1 conversations

``` sql
conversations
-----------------------------
id
type
created_by
created_at
updated_at
last_message_id
```

Recommended fields:

``` text
id: UUID
type: enum
created_by: UUID
created_at: timestamp
updated_at: timestamp
last_message_id: UUID
```

------------------------------------------------------------------------

# 31. conversation_participants

``` sql
conversation_participants
-----------------------------
id
conversation_id
user_id
user_type
joined_at
last_read_message_id
last_read_at
muted
archived
```

Constraints:

``` text
unique(conversation_id, user_id)
```

For a direct brand-influencer conversation, there should normally be two
participants.

------------------------------------------------------------------------

# 32. messages

``` sql
messages
-----------------------------
id
conversation_id
sender_id
message_type
content
metadata
client_message_id
created_at
updated_at
```

Recommended fields:

``` text
id: UUID
conversation_id: UUID
sender_id: UUID nullable
message_type: TEXT | FILE | IMAGE | SYSTEM
content: TEXT nullable
metadata: JSONB nullable
client_message_id: VARCHAR
created_at: timestamp
updated_at: timestamp
```

`sender_id` may be nullable for platform-generated system messages.

------------------------------------------------------------------------

# 33. attachments

``` sql
attachments
-----------------------------
id
message_id
object_key
file_name
mime_type
file_size
status
created_at
```

Status:

``` text
PENDING
SCANNING
AVAILABLE
BLOCKED
FAILED
```

------------------------------------------------------------------------

# 34. Optional message_events

For advanced auditing:

``` sql
message_events
-----------------------------
id
message_id
user_id
event_type
created_at
metadata
```

Examples:

``` text
DELIVERED
READ
```

For v1, read state can be maintained through `conversation_participants`
rather than creating an event row for every read.

------------------------------------------------------------------------

# 35. Collaboration Integration

Messaging must integrate with the collaboration service.

Recommended event-driven interface:

``` text
Collaboration Service
       |
       | Domain Event
       v
Event Bus
       |
       v
Messaging Service
```

Events:

``` text
COLLABORATION_REQUEST_CREATED
COLLABORATION_REQUEST_ACCEPTED
COLLABORATION_REQUEST_REJECTED
COLLABORATION_REQUEST_WITHDRAWN
```

------------------------------------------------------------------------

# 36. Collaboration Request Creation

When influencer clicks:

``` text
Request Collaboration
```

Backend performs:

``` text
1. Validate influencer.
2. Validate brand.
3. Validate eligibility.
4. Create collaboration request.
5. Find/create conversation.
6. Create system message.
7. Broadcast system message.
8. Create notification.
```

Example system message:

``` text
"Sushabhan sent you a collaboration request."
```

------------------------------------------------------------------------

# 37. Collaboration Acceptance

When brand clicks:

``` text
Accept Collaboration
```

Backend:

``` text
1. Validate brand authorization.
2. Update collaboration status.
3. Emit COLLABORATION_REQUEST_ACCEPTED.
4. Messaging service creates SYSTEM message.
5. Broadcast via WebSocket.
6. Create notification.
```

Result:

``` text
Brand accepted your collaboration request.
```

The message should appear instantly without requiring the influencer to
refresh the page.

------------------------------------------------------------------------

# 38. Transactional Consistency

For critical events, avoid this unsafe sequence:

``` text
Update collaboration
    |
    X WebSocket message
    |
    X database message
```

If the server crashes after updating the collaboration but before
creating the message, the UI may become inconsistent.

Preferred:

``` text
Database Transaction
   |
   +--> Update collaboration
   |
   +--> Create outbox event
   |
   v
Commit
   |
   v
Outbox Worker
   |
   v
Create System Message
   |
   v
Broadcast WebSocket
```

This is the recommended production architecture.

------------------------------------------------------------------------

# 39. Outbox Pattern

Create:

``` sql
outbox_events
-----------------------------
id
event_type
aggregate_id
payload
status
created_at
processed_at
```

Example:

``` json
{
  "eventType": "COLLABORATION_REQUEST_ACCEPTED",
  "aggregateId": "collab_123",
  "payload": {
    "brandId": "brand_123",
    "influencerId": "creator_456",
    "conversationId": "conv_123"
  }
}
```

A worker consumes the event and creates the system message.

------------------------------------------------------------------------

# 40. Conversation Creation Rules

When a collaboration request is created:

``` text
Does conversation exist between Brand and Influencer?
          |
      +---+---+
      |       |
     YES      NO
      |       |
      |       v
      |   Create conversation
      |       |
      +-------+
              |
              v
        Create system message
```

Recommended unique business constraint for a direct relationship:

``` text
brand_id + influencer_id
```

However, if Zerify later supports multiple campaigns between the same
users, the conversation model should allow campaign-specific
conversations.

------------------------------------------------------------------------

# 41. API Design

## Create conversation

``` http
POST /api/v1/conversations
```

Request:

``` json
{
  "participantId": "user_456",
  "type": "DIRECT"
}
```

Response:

``` json
{
  "id": "conv_123",
  "type": "DIRECT",
  "createdAt": "..."
}
```

------------------------------------------------------------------------

# 42. List Conversations

``` http
GET /api/v1/conversations?cursor=...
```

Response:

``` json
{
  "items": [
    {
      "id": "conv_123",
      "participant": {
        "id": "user_456",
        "name": "Brand XYZ",
        "avatarUrl": "..."
      },
      "lastMessage": {
        "type": "TEXT",
        "content": "Let's discuss the campaign."
      },
      "unreadCount": 2,
      "updatedAt": "..."
    }
  ],
  "nextCursor": "..."
}
```

------------------------------------------------------------------------

# 43. Get Conversation Messages

``` http
GET /api/v1/conversations/{conversationId}/messages?cursor=...
```

Use cursor-based pagination.

Do not use very large offset-based pagination.

Recommended:

``` text
limit = 30–50
```

Messages should normally be returned newest-first from the API and
rendered oldest-to-newest in the conversation UI, or use whichever
ordering is consistent with the existing backend conventions.

------------------------------------------------------------------------

# 44. Send Message REST Fallback

Although WebSockets are the primary transport, a REST endpoint is useful
as a fallback:

``` http
POST /api/v1/conversations/{conversationId}/messages
```

This is particularly useful for:

-   system integrations
-   retry fallback
-   testing
-   server-to-server workflows

The normal interactive UI should use WebSockets.

------------------------------------------------------------------------

# 45. WebSocket Authentication

The WebSocket connection must authenticate using the existing Zerify
authentication mechanism.

Never trust:

``` text
conversationId
senderId
```

from the client without authorization.

Server derives:

``` text
senderId = authenticatedUser.id
```

Then verifies:

``` text
authenticatedUser belongs to conversation
```

------------------------------------------------------------------------

# 46. Authorization Rules

A user can:

-   View conversations they participate in.
-   Send messages only to conversations they participate in.
-   Upload files only to conversations they participate in.
-   Download attachments only from conversations they participate in.
-   Mark messages read only in conversations they participate in.

A user cannot:

-   Read another user's conversation.
-   Send messages as another user.
-   Download another user's attachment.
-   Generate a collaboration acceptance system message directly.
-   Modify system messages from the client.

------------------------------------------------------------------------

# 47. WebSocket Room Model

Use one room per conversation:

``` text
conversation:{conversationId}
```

When user opens conversation:

``` text
socket.join("conversation:conv_123")
```

When message is sent:

``` text
io.to("conversation:conv_123").emit("message:new", message)
```

Do not broadcast private message contents globally.

------------------------------------------------------------------------

# 48. Multi-Instance Scaling

A single WebSocket server works for development but is not sufficient
for a large production deployment.

Production architecture:

``` text
                  Load Balancer
                       |
          +------------+------------+
          |            |            |
          v            v            v
      WS Server    WS Server    WS Server
          |            |            |
          +------------+------------+
                       |
                     Redis
                       |
                       v
                  Event Pub/Sub
                       |
                       v
                    Database
```

Redis can be used for:

-   WebSocket adapter/pub-sub.
-   Presence.
-   distributed events.
-   ephemeral connection state.

------------------------------------------------------------------------

# 49. Reconnection

The client must automatically reconnect after:

-   Wi-Fi interruption.
-   Network change.
-   Laptop sleep/wake.
-   Server restart.
-   temporary WebSocket failure.

After reconnect:

``` text
Connect
  |
  v
Authenticate
  |
  v
Fetch missed messages
  |
  v
Rejoin active conversations
  |
  v
Resume normal real-time state
```

The client must not assume that a successful reconnect means no messages
were missed.

------------------------------------------------------------------------

# 50. Missed Message Synchronization

Use a cursor or message sequence.

Example:

``` json
{
  "conversationId": "conv_123",
  "lastKnownMessageId": "msg_450"
}
```

Backend returns:

``` text
msg_451
msg_452
msg_453
```

The frontend merges these into local state.

------------------------------------------------------------------------

# 51. Ordering

Messages must have deterministic ordering.

Use:

``` text
created_at
```

plus a unique ID or server-generated sequence to break ties.

For high-scale implementations, a conversation-level monotonically
increasing sequence is preferable:

``` text
sequence_number
```

Example:

``` text
1001
1002
1003
1004
```

This makes synchronization and ordering easier.

------------------------------------------------------------------------

# 52. Duplicate Message Prevention

Frontend should optimistically display:

``` text
Sending...
```

When server acknowledgement arrives:

``` text
SENT
```

The temporary client message should be replaced/reconciled using:

``` text
clientMessageId
```

Never simply append the acknowledged message without reconciliation,
otherwise duplicates can appear.

------------------------------------------------------------------------

# 53. Offline Behavior

If a user temporarily loses network connectivity:

``` text
Message
   |
   v
Local pending state
   |
   v
Reconnect
   |
   v
Retry
```

Retry should use the same:

``` text
clientMessageId
```

so that the backend remains idempotent.

------------------------------------------------------------------------

# 54. Notifications

Messaging should integrate with the notification service.

When recipient is not actively viewing the conversation:

``` text
message:new
    |
    v
Notification Service
    |
    +--> In-app notification
    +--> Push notification (future/mobile)
    +--> Email notification (configurable)
```

Example:

``` text
Brand XYZ
You have a new message:
"Please send your media kit."
```

System events can have higher-priority notifications:

``` text
Your collaboration request was accepted.
```

------------------------------------------------------------------------

# 55. Notification Deduplication

Do not create multiple notifications for the same message/event because
of WebSocket retries.

Use:

``` text
unique(event_id, recipient_id, notification_type)
```

or equivalent idempotency keys.

------------------------------------------------------------------------

# 56. Search

V1 should support searching conversations by:

-   Participant name.
-   Brand name.
-   Influencer name.

Optional message-content search can be added later.

Potential API:

``` http
GET /api/v1/conversations/search?q=brand
```

------------------------------------------------------------------------

# 57. Conversation Archive / Mute

Recommended v1 support:

``` text
Mute
Archive
Unarchive
```

Mute should affect notifications, not message delivery.

Archived conversations should still receive messages but may remain
hidden from the default conversation list depending on product rules.

------------------------------------------------------------------------

# 58. Message UI Components

Recommended component hierarchy:

``` text
MessagesPage
├── ConversationSidebar
│   ├── ConversationSearch
│   ├── ConversationList
│   └── ConversationListItem
│
└── ConversationView
    ├── ConversationHeader
    ├── MessageList
    │   ├── DateSeparator
    │   ├── TextMessage
    │   ├── FileMessage
    │   ├── ImageMessage
    │   └── SystemMessage
    │
    ├── TypingIndicator
    └── MessageComposer
        ├── AttachmentButton
        ├── FileUploadProgress
        ├── TextInput
        └── SendButton
```

------------------------------------------------------------------------

# 59. System Message UI

System messages should visually differ from normal messages.

Example:

``` text
────────────────────────────────
   ✓ Brand accepted your
     collaboration request.
────────────────────────────────
```

System messages should not appear as if the user typed them.

------------------------------------------------------------------------

# 60. File Message UI

Example:

``` text
┌────────────────────────────────┐
│ 📄 campaign-brief.pdf          │
│ 2.4 MB                         │
│                                │
│ Download                       │
└────────────────────────────────┘
```

For images:

``` text
┌──────────────────────┐
│                      │
│       IMAGE          │
│                      │
└──────────────────────┘
```

------------------------------------------------------------------------

# 61. Message Composer

Composer should support:

``` text
[📎] [ Type a message...                    ] [Send]
```

Behavior:

-   Enter sends message.
-   Shift+Enter inserts newline.
-   Empty message cannot be sent.
-   Attachment can be selected independently.
-   Uploading attachment should not freeze the composer.
-   Failed upload should allow retry.
-   Sending state should disable duplicate submission.

------------------------------------------------------------------------

# 62. File Size UX

Before upload:

``` text
if file.size > 25 MB:
    show "Files must be 25 MB or smaller."
```

The backend must perform the same validation even if frontend validation
exists.

Frontend validation is only for user experience.

------------------------------------------------------------------------

# 63. Attachment Metadata

Store:

``` json
{
  "fileName": "campaign-brief.pdf",
  "mimeType": "application/pdf",
  "fileSize": 2450000,
  "objectKey": "messages/...",
  "status": "AVAILABLE"
}
```

Do not store the actual binary file in PostgreSQL/MySQL.

------------------------------------------------------------------------

# 64. Data Retention

Messaging data should be retained according to Zerify's product/legal
policy.

Do not hard-code a short retention period into the messaging
implementation unless the product explicitly requires it.

------------------------------------------------------------------------

# 65. Auditability

Important marketplace system events should be auditable.

For example:

``` text
COLLABORATION_REQUEST_ACCEPTED
```

should exist in the collaboration/audit domain even if the corresponding
message is later hidden or the UI changes.

The message is a communication representation of the event, not the
source of truth for collaboration state.

------------------------------------------------------------------------

# 66. Source of Truth

Important rule:

``` text
Collaboration Service
    = source of truth for collaboration status

Messaging Service
    = source of truth for conversation/messages

Notification Service
    = source of truth for notifications
```

Do not determine collaboration status by reading the latest system
message.

For example, this is wrong:

``` text
if latest message == "accepted":
    collaboration = accepted
```

Instead:

``` text
collaboration.status == ACCEPTED
```

------------------------------------------------------------------------

# 67. API Error Responses

Use a consistent format:

``` json
{
  "error": {
    "code": "CONVERSATION_ACCESS_DENIED",
    "message": "You do not have access to this conversation."
  }
}
```

Common errors:

``` text
CONVERSATION_NOT_FOUND
CONVERSATION_ACCESS_DENIED
MESSAGE_EMPTY
MESSAGE_TOO_LONG
INVALID_MESSAGE_TYPE
FILE_TOO_LARGE
FILE_TYPE_NOT_ALLOWED
ATTACHMENT_NOT_FOUND
UPLOAD_EXPIRED
MESSAGE_DUPLICATE
RATE_LIMITED
```

------------------------------------------------------------------------

# 68. Message Length

Recommended v1 limit:

``` text
10,000 characters per message
```

This should be configurable.

The backend must enforce it.

------------------------------------------------------------------------

# 69. Rate Limiting

Protect WebSocket and REST endpoints.

Example starting limits:

``` text
Messages:
60 messages/minute/user

Upload URL requests:
20/minute/user

Conversation creation:
20/minute/user

Typing events:
client throttled
```

These are initial engineering defaults and should be tuned after
observing real traffic.

------------------------------------------------------------------------

# 70. Abuse Protection

Messaging must support reporting/blocking at the platform level.

Potential future capabilities:

``` text
Report user
Block user
Report message
Restrict communication
```

The messaging architecture should not prevent these features from being
added later.

------------------------------------------------------------------------

# 71. Security Checklist

## Authentication

-   Validate access token.
-   Reject expired tokens.
-   Authenticate WebSocket handshake.

## Authorization

-   Validate conversation membership.
-   Validate attachment ownership.
-   Derive sender from authenticated user.

## Files

-   Private object storage.
-   Maximum 25 MB.
-   MIME/type validation.
-   Malware scanning.
-   Signed download URLs.
-   Short URL expiry.

## Database

-   Parameterized queries.
-   ORM/query-builder protections.
-   Proper indexes.
-   Foreign keys.

## WebSockets

-   Authenticate connection.
-   Validate every event.
-   Rate limit events.
-   Never trust client-supplied sender ID.
-   Never trust client-supplied system-message text.

------------------------------------------------------------------------

# 72. Database Indexes

Recommended:

``` sql
INDEX messages_conversation_created
ON messages(conversation_id, created_at DESC);

INDEX messages_conversation_sequence
ON messages(conversation_id, sequence_number);

INDEX participants_user
ON conversation_participants(user_id);

INDEX conversations_updated
ON conversations(updated_at DESC);

UNIQUE messages_client_id
ON messages(conversation_id, sender_id, client_message_id);
```

Exact syntax should follow the database engine used by Zerify.

------------------------------------------------------------------------

# 73. Backend Services

Recommended service boundaries:

``` text
MessagingModule
├── ConversationService
├── MessageService
├── AttachmentService
├── PresenceService
├── WebSocketGateway
├── MessageEventService
└── NotificationIntegration
```

Collaboration module:

``` text
CollaborationModule
├── CollaborationService
├── CollaborationEventPublisher
└── CollaborationStatusService
```

------------------------------------------------------------------------

# 74. Suggested Backend Folder Structure

``` text
src/
├── modules/
│   ├── messaging/
│   │   ├── controllers/
│   │   ├── gateways/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── dto/
│   │   ├── events/
│   │   ├── entities/
│   │   └── messaging.module.ts
│   │
│   ├── collaboration/
│   │   ├── services/
│   │   ├── events/
│   │   └── collaboration.module.ts
│   │
│   └── notifications/
│
├── infrastructure/
│   ├── websocket/
│   ├── storage/
│   ├── redis/
│   └── database/
│
└── shared/
```

Adapt naming to the existing Zerify repository architecture.

------------------------------------------------------------------------

# 75. Frontend State Management

Messaging state should be centralized.

Recommended state:

``` text
conversations
activeConversationId
messagesByConversation
typingUsers
presence
pendingMessages
uploadStates
unreadCounts
connectionStatus
```

Example:

``` text
connectionStatus:
CONNECTED
CONNECTING
DISCONNECTED
RECONNECTING
```

------------------------------------------------------------------------

# 76. Frontend Message State

Each pending message may initially look like:

``` json
{
  "clientMessageId": "tmp_123",
  "status": "SENDING",
  "content": "Hello"
}
```

After acknowledgement:

``` json
{
  "messageId": "msg_456",
  "clientMessageId": "tmp_123",
  "status": "SENT",
  "content": "Hello"
}
```

------------------------------------------------------------------------

# 77. Optimistic UI

For text messages:

``` text
User presses Send
      |
      v
Message immediately appears
      |
      v
status = SENDING
      |
      v
Server ACK
      |
      v
status = SENT
```

If server fails:

``` text
status = FAILED
Retry button
```

This makes the application feel instantaneous.

------------------------------------------------------------------------

# 78. WebSocket Message Contract

Example:

``` json
{
  "event": "message:new",
  "data": {
    "messageId": "msg_123",
    "conversationId": "conv_123",
    "sender": {
      "id": "user_123",
      "name": "Creator Name"
    },
    "type": "TEXT",
    "content": "Hello!",
    "createdAt": "2026-09-06T10:30:00Z"
  }
}
```

System message:

``` json
{
  "event": "message:new",
  "data": {
    "messageId": "msg_124",
    "conversationId": "conv_123",
    "sender": null,
    "type": "SYSTEM",
    "systemEvent": "COLLABORATION_REQUEST_ACCEPTED",
    "content": "Brand accepted your collaboration request.",
    "createdAt": "2026-09-06T10:31:00Z"
  }
}
```

------------------------------------------------------------------------

# 79. Collaboration System Message Metadata

Do not rely only on rendered text.

Store structured metadata:

``` json
{
  "systemEvent": "COLLABORATION_REQUEST_ACCEPTED",
  "collaborationId": "collab_123",
  "brandId": "brand_123",
  "influencerId": "creator_456"
}
```

This allows the frontend to render localized or redesigned messages
later.

------------------------------------------------------------------------

# 80. Internationalization

System messages should preferably use message keys.

Instead of storing only:

``` text
"Brand accepted your collaboration request."
```

store:

``` json
{
  "systemEvent": "COLLABORATION_REQUEST_ACCEPTED",
  "messageKey": "collaboration.accepted"
}
```

The UI can render the localized string.

However, storing a server-generated human-readable snapshot can be
useful for audit/history. Choose one consistent strategy across the
product.

------------------------------------------------------------------------

# 81. Real-Time Event Flow: Text

``` text
                ┌──────────────┐
                │   User A     │
                └──────┬───────┘
                       │
                  message:send
                       │
                       v
                ┌──────────────┐
                │ WebSocket GW │
                └──────┬───────┘
                       │
                  Authorization
                       │
                       v
                ┌──────────────┐
                │ Message Svc  │
                └──────┬───────┘
                       │
                    Persist
                       │
                       v
                ┌──────────────┐
                │  Database    │
                └──────┬───────┘
                       │
                 message:new
                       │
              ┌────────┴────────┐
              v                 v
         User A socket      User B socket
```

------------------------------------------------------------------------

# 82. Real-Time Event Flow: Collaboration Acceptance

``` text
Brand clicks Accept
        |
        v
Collaboration API
        |
        v
Update Collaboration
        |
        v
Outbox Event
        |
        v
Event Worker
        |
        v
Messaging Service
        |
        v
Create SYSTEM message
        |
        v
WebSocket Gateway
        |
        v
Influencer
        |
        v
"Brand accepted your collaboration request."
```

------------------------------------------------------------------------

# 83. Real-Time Event Flow: File

``` text
User
 |
 | Request upload URL
 v
Backend
 |
 v
Presigned URL
 |
 v
Object Storage
 |
 | Upload <= 25 MB
 v
Upload Complete
 |
 v
Create Attachment
 |
 v
Create FILE Message
 |
 v
WebSocket
 |
 v
Recipient sees document instantly
```

------------------------------------------------------------------------

# 84. Failure Handling

## WebSocket failure

``` text
Reconnect automatically.
Fetch missed messages.
Rejoin rooms.
```

## Database failure

``` text
Do not acknowledge message.
Return FAILED.
Client may retry.
```

## Object storage failure

``` text
Mark upload FAILED.
Allow retry.
Do not create an AVAILABLE file message.
```

## Malware scan failure

``` text
Mark attachment BLOCKED/FAILED.
Do not provide download access.
```

## Event worker failure

``` text
Keep outbox event.
Retry with exponential backoff.
Do not lose system message events.
```

------------------------------------------------------------------------

# 85. Observability

Track:

``` text
websocket_connections
websocket_connection_failures
message_send_success
message_send_failure
message_delivery_latency
message_read_latency
attachment_upload_success
attachment_upload_failure
attachment_scan_failure
system_event_processing_failure
```

Important latency metric:

``` text
message_created_at
        ->
recipient_received_at
```

Target for normal operation:

``` text
p95 < 500 ms
```

The exact SLA should be finalized after load testing.

------------------------------------------------------------------------

# 86. Logging

Every important operation should include:

``` text
requestId
userId
conversationId
messageId
eventId
timestamp
```

Never log:

-   access tokens
-   signed download URLs
-   private message contents unnecessarily
-   sensitive attachment contents

------------------------------------------------------------------------

# 87. Testing Strategy

## Unit tests

Test:

-   Message validation.
-   Authorization.
-   Collaboration event handling.
-   System message generation.
-   Idempotency.
-   Attachment validation.
-   Read state.
-   Notification triggering.

## Integration tests

Test:

``` text
create conversation
send message
receive WebSocket event
read message
upload file
download file
accept collaboration
system message creation
```

## WebSocket tests

Test:

-   connection
-   authentication
-   room joining
-   message send
-   message broadcast
-   reconnect
-   duplicate send
-   unauthorized conversation
-   typing
-   presence

## Load tests

Test:

``` text
1,000 concurrent sockets
5,000 concurrent sockets
10,000 concurrent sockets
```

Actual production capacity should be established through load testing
against the selected infrastructure.

------------------------------------------------------------------------

# 88. Acceptance Criteria

## Messaging

-   [ ] User can open Messages.
-   [ ] User can see conversation list.
-   [ ] User can open a conversation.
-   [ ] User can send a text message.
-   [ ] Recipient receives it without refreshing.
-   [ ] Message persists after page reload.
-   [ ] Sender receives acknowledgement.
-   [ ] Duplicate retries do not duplicate messages.

## WebSockets

-   [ ] WebSocket connects after authentication.
-   [ ] Unauthorized sockets are rejected.
-   [ ] Messages are delivered in real time.
-   [ ] Reconnection works.
-   [ ] Missed messages are synchronized.
-   [ ] Multiple tabs/devices work correctly.

## Attachments

-   [ ] User can upload a file.
-   [ ] Maximum size is 25 MB.
-   [ ] Files above 25 MB are rejected.
-   [ ] Allowed file types are validated.
-   [ ] Upload progress is displayed.
-   [ ] Recipient receives attachment message in real time.
-   [ ] Download requires authorization.
-   [ ] Files are not publicly accessible.

## Collaboration

-   [ ] Collaboration request creates a conversation if needed.
-   [ ] Collaboration request creates system message.
-   [ ] Brand acceptance creates system message.
-   [ ] System message is delivered in real time.
-   [ ] System message remains visible after refresh.
-   [ ] System message cannot be forged from the frontend.
-   [ ] Collaboration status remains sourced from collaboration data.

## Notifications

-   [ ] New messages create notifications when appropriate.
-   [ ] Collaboration acceptance creates notification.
-   [ ] Duplicate notifications are prevented.

------------------------------------------------------------------------

# 89. Recommended Implementation Order

## Phase 1 --- Database

Implement:

``` text
conversations
conversation_participants
messages
attachments
outbox_events
```

Add indexes and constraints.

## Phase 2 --- REST APIs

Implement:

``` text
create conversation
list conversations
get messages
upload URL
attachment completion
```

## Phase 3 --- WebSocket

Implement:

``` text
connect
authenticate
join conversation
message:send
message:new
message:ack
message:read
```

## Phase 4 --- Frontend

Implement:

``` text
conversation sidebar
conversation view
message list
composer
optimistic messaging
reconnection
```

## Phase 5 --- Attachments

Implement:

``` text
presigned upload
25 MB validation
progress
attachment messages
signed downloads
```

## Phase 6 --- Collaboration Integration

Implement:

``` text
COLLABORATION_REQUEST_CREATED
COLLABORATION_REQUEST_ACCEPTED
COLLABORATION_REQUEST_REJECTED
```

and system messages.

## Phase 7 --- Presence & Typing

Implement:

``` text
online status
typing indicators
```

## Phase 8 --- Notifications

Integrate with notification infrastructure.

## Phase 9 --- Security & Production Hardening

Implement:

``` text
rate limits
malware scanning
audit logging
monitoring
load testing
```

------------------------------------------------------------------------

# 90. Definition of Done

The Messaging feature is complete when:

1.  Brand and influencer users can communicate in real time.
2.  WebSockets are the primary real-time transport.
3.  Messages persist in the database.
4.  Reconnection does not lose messages.
5.  Duplicate message retries are safely handled.
6.  Conversations support unread/read states.
7.  Typing indicators work.
8.  Presence works.
9.  Files up to 25 MB can be uploaded.
10. Files are stored outside the relational database.
11. Files are protected using authorization and signed URLs.
12. System messages are generated by backend business events.
13. Collaboration acceptance immediately creates a visible system
    message.
14. System messages are persisted.
15. System messages cannot be fabricated by the client.
16. Notifications are generated correctly.
17. Unauthorized users cannot access conversations or attachments.
18. Automated tests cover critical workflows.
19. WebSocket and file-upload failures are handled gracefully.
20. Production monitoring and logging are available.

------------------------------------------------------------------------

# 91. Example End-to-End Zerify Scenario

## Step 1 --- Influencer reaches out

Influencer opens a brand profile:

``` text
Brand: Nike
```

Clicks:

``` text
Request Collaboration
```

## Step 2 --- Backend creates collaboration

``` text
Collaboration
status = PENDING
```

## Step 3 --- Conversation is created

``` text
conversationId = conv_123
```

## Step 4 --- System message

``` text
Sushabhan sent you a collaboration request.
```

## Step 5 --- Brand receives it

The brand is currently online.

WebSocket:

``` text
message:new
```

UI immediately displays:

``` text
────────────────────────────
Sushabhan sent you a
collaboration request.
────────────────────────────
```

## Step 6 --- Brand accepts

Brand clicks:

``` text
Accept Collaboration
```

Backend:

``` text
collaboration.status = ACCEPTED
```

## Step 7 --- Domain event

``` text
COLLABORATION_REQUEST_ACCEPTED
```

## Step 8 --- Messaging service

Creates:

``` text
SYSTEM
"Brand accepted your collaboration request."
```

## Step 9 --- WebSocket

Influencer instantly receives:

``` text
Brand accepted your collaboration request.
```

No page refresh is required.

## Step 10 --- Normal messaging

Influencer sends:

``` text
"Thank you! I'll share my media kit."
```

Brand receives it instantly.

## Step 11 --- File

Influencer attaches:

``` text
media-kit.pdf
4.8 MB
```

File is uploaded directly to object storage.

Messaging service creates:

``` text
FILE MESSAGE
media-kit.pdf
4.8 MB
```

Brand sees it immediately.

------------------------------------------------------------------------

# 92. Final Target Architecture

``` text
                         ZERIFY
                           |
             +-------------+-------------+
             |                           |
             v                           v
      Collaboration                  Messaging
          Service                      Service
             |                           |
             | Domain Events             |
             +------------+--------------+
                          |
                          v
                     Outbox/Event
                        Worker
                          |
             +------------+------------+
             |                         |
             v                         v
       Message Database            WebSocket
             |                     Gateway
             |                         |
             |                  +------+------+
             |                  |             |
             v                  v             v
          Messages           Brand       Influencer
          Conversations
          Attachments
             |
             v
       Object Storage
       (files <= 25MB)

Supporting infrastructure:

        Redis
          |
          +--> WebSocket Pub/Sub
          +--> Presence
          +--> Distributed state

        Notification Service
          |
          +--> In-app
          +--> Push
          +--> Email
```

------------------------------------------------------------------------

# 93. Key Engineering Rules

1.  **WebSocket for real-time communication.**
2.  **Database is the source of truth for messages.**
3.  **Object storage is the source of truth for files.**
4.  **Collaboration service is the source of truth for collaboration
    status.**
5.  **Never trust client-supplied sender IDs.**
6.  **Never generate important system events purely in the frontend.**
7.  **Use idempotency for message retries.**
8.  **Use an outbox pattern for critical cross-service events.**
9.  **Do not transfer 25 MB files through WebSockets.**
10. **Use presigned object-storage uploads.**
11. **Keep files private.**
12. **Validate the 25 MB limit on both frontend and backend.**
13. **Persist system messages.**
14. **Broadcast system messages over WebSockets.**
15. **Support reconnection and missed-message synchronization.**
16. **Design for multiple active sockets per user.**
17. **Use cursor-based message pagination.**
18. **Add proper database indexes.**
19. **Rate-limit messaging and upload operations.**
20. **Build the messaging layer so future group chats, reactions, media,
    and campaign-specific communication can be added without redesigning
    the core architecture.**
