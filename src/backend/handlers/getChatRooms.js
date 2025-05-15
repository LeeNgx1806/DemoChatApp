import { DynamoDBClient, QueryCommand, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, user-id",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({ message: "CORS preflight response" }),
    };
  }

  const userId = event.headers["user-id"]; // Extract from request headers

  if (!userId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "User ID is required" }),
    };
  }

  try {
    // Query UserChats table to find all chatIds the user belongs to
    const userChatsParams = {
      TableName: "UserChats",
      KeyConditionExpression: "userId = :userId", // using userId as PK
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
    };

    const userChatsResult = await client.send(new QueryCommand(userChatsParams));

    if (!userChatsResult.Items || userChatsResult.Items.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify([]), // User has no chats
      };
    }

    // Fetch chat details from the Chats table using BatchGetItemCommand
    const chatIds = userChatsResult.Items.map((item) => ({
      chatId: { S: item.chatId.S }, // Ensure chatId is correctly formatted
    }));

    const chatsParams = {
      RequestItems: {
        Chats: {
          Keys: chatIds,
        },
      },
    };

    const chatsResult = await client.send(new BatchGetItemCommand(chatsParams));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(chatsResult.Responses?.Chats || []),
    };
  } catch (err) {
    console.error("Error fetching chat rooms:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to fetch chat rooms" }),
    };
  }
};
