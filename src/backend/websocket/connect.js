import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Client
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("Event received:", JSON.stringify(event));

        const { connectionId } = event.requestContext;
        const chatId = event.queryStringParameters?.chatId || "default";

        // Check if chatId exists in Chats Table
        const chatExists = await dynamoDB.send(
            new GetCommand({
                TableName: "Chats",
                Key: { chatId: chatId },
            })
        );

        if (!chatExists.Item) {
            return { statusCode: 400, body: "Invalid chatId" };
        }

        // Store connection with chatId
        await dynamoDB.send(
            new PutCommand({
                TableName: "Connections",
                Item: { connectionId, chatId },
            })
        );

        return { statusCode: 200, body: "Connected" };
    } catch (error) {
        console.error("Error in connect handler:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};

