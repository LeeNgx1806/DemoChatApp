import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { sendToClient } from "./sendToConnection.js";

const dynamoDBClient = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (event) => {
    try {
        console.log("WebSocket message received:", event);

        const { connectionId } = event.requestContext;
        const body = JSON.parse(event.body);
        
        if (body.type === "getMessages") {
            const chatId = body.chatId;
            
            // Fetch past messages from DynamoDB
            const params = {
                TableName: "Messages",
                KeyConditionExpression: "chatId = :chatId",
                ExpressionAttributeValues: {
                    ":chatId": chatId,
                },
                ScanIndexForward: true, // Sort in ascending order (oldest first)
            };

            const result = await dynamoDB.send(new QueryCommand(params));
            const messages = result.Items || [];

            // Send past messages back to the client
            await sendToClient(connectionId, { type: "messages", chatId, messages });
        }
    } catch (error) {
        console.error("Error handling WebSocket message:", error);
    }
};
