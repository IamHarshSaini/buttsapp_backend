// Create a user
app.post('/users', async (req, res) => {
  const { phoneNumber, name } = req.body
  try {
    const user = new User({ phoneNumber, name })
    await user.save()
    res.status(201).send(user)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

// Send a message
app.post('/messages', async (req, res) => {
  const { senderId, chatId, content, type } = req.body
  try {
    const message = new Message({
      sender: senderId,
      chat: chatId,
      content,
      type,
    })
    await message.save()

    // Update lastMessage in Chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id })

    res.status(201).send(message)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

// Create a one-to-one chat
app.post('/chats', async (req, res) => {
  const { memberIds } = req.body // Array of two user IDs for one-to-one chat
  try {
    const chat = new Chat({
      members: memberIds,
      isGroup: false,
    })
    await chat.save()
    res.status(201).send(chat)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

// Create a group chat
app.post('/groups', async (req, res) => {
  const { name, memberIds, adminIds } = req.body
  try {
    const group = new Group({
      name,
      members: memberIds,
      admins: adminIds,
    })
    await group.save()

    const chat = new Chat({
      members: memberIds,
      isGroup: true,
      groupName: name,
      admins: adminIds,
    })
    await chat.save()

    res.status(201).send({ group, chat })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

// Get all messages for a chat
app.get('/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params
  try {
    const messages = await Message.find({ chat: chatId }).populate('sender')
    res.status(200).send(messages)
  } catch (error) {
    res.status(400).send(error.message)
  }
})

// POST /users
// {
//   "phoneNumber": "+123456789",
//   "name": "John Doe"
// }

// POST /chats
// {
//   "memberIds": ["user1ObjectId", "user2ObjectId"]
// }

// POST /groups
// {
//   "name": "Friends Group",
//   "memberIds": ["user1ObjectId", "user2ObjectId", "user3ObjectId"],
//   "adminIds": ["user1ObjectId"]
// }

// POST /messages
// {
//   "senderId": "user1ObjectId",
//   "chatId": "chatObjectId",
//   "content": "Hello!",
//   "type": "text"
// }

// The chatId in the /messages route represents the unique identifier of the chat (conversation) that the message belongs to. This chatId is generated when a new chat (either one-to-one or group) is created and saved in the Chat collection.

// Here's a breakdown of how the chatId is created and how it will be used when sending a message:

// 1. Creating a Chat (One-to-One or Group)
// When you create a new chat, either one-to-one or group, a new document is inserted into the Chat collection, and a unique _id is automatically assigned by MongoDB. This _id serves as the chatId.

// One-to-One Chat:
// When you create a one-to-one chat using the /chats endpoint, you pass in the memberIds of the two participants, and MongoDB generates an _id for this chat.

// Group Chat:
// When you create a group chat using the /groups endpoint, you also create a corresponding chat in the Chat collection with the members and admins. This chat will also have a unique _id.
