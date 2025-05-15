import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { sendToClient } from "../websocket/sendToConnection.js";
import { errorHandler } from "../utils/errorHandler.js";

const dynamoDBClient = new DynamoDBClient();

export const handler = async (event) => {
    try {
        const messages = event.Records.map(record => {
            const body = JSON.parse(record.body);
            return {
                MessageId: record.messageId,
                Body: body,
                Timestamp: record.attributes.ApproximateFirstReceiveTimestamp
            };
        });

        await Promise.all(messages.map(async (message) => {
            // Process each message
            await processMessage(message);
            // Store in DynamoDB
            await storeMessage(message);
            // Notify connected clients
            await notifyClients(message);
        }));

        return { statusCode: 200 };
    } catch (error) {
        return errorHandler(error, 'Message Processing');
    }
};


