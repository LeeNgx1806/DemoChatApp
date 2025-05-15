import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export const handler = async (event) => {
  const { name, createdBy, participants } = JSON.parse(event.body);
  const chatId = Date.now().toString(); // Generate unique chat room ID

  const params = {
    TableName: "Chats",
    Item: {
      chatId: { S: chatId },
      name: { S: name },
      createdBy: { S: createdBy },
      participants: { SS: participants }, // Store participants as a list of user IDs
      lastMessage: { S: "" }, // Initialize with an empty last message
    },
  };

  try {
    await client.send(new PutItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ chatId, name, createdBy, participants }),
    };
  } catch (err) {
    console.error("Error creating chat room:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create chat room" }),
    };
  }
};
