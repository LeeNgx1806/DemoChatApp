import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Client
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("Event received:", JSON.stringify(event));

        const { connectionId } = event.requestContext;
        const timestamp = new Date().toISOString();

        await dynamoDB.put({
            TableName: 'Connections',
            Item: {
                connectionId,
                timestamp,
                ttl: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hour TTL
            }
        }).promise();

        return { statusCode: 200, body: 'Connected' };
    } catch (error) {
        return errorHandler(error, 'WebSocket Connect');
    }
};
