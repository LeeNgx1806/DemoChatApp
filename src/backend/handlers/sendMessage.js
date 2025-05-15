
import { DynamoDBClient, ScanCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { sendToClient } from "../websocket/sendToConnection.js";

// AWS Clients
const dynamoDBClient = new DynamoDBClient();
const snsClient = new SNSClient();

export const handler = async (event) => {
    let connectionsData;
    try {
        const { chatId, senderId, text } = JSON.parse(event.body);
        const messageId = `${chatId}-${Date.now()}`;

        // Store message in DynamoDB
        await dynamoDBClient.send(new PutItemCommand({
            TableName: "Messages",
            Item: {
                messageId: { S: messageId },
                chatId: { S: chatId },
                senderId: { S: senderId },
                text: { S: text },
                timestamp: { S: new Date().toISOString() },
            },
        }));

        console.log("Message stored in DynamoDB successfully");

        // Check if the function proceeds to WebSocket part
        console.log("Fetching active WebSocket connections...");


        try {
            connectionsData = await dynamoDBClient.send(new ScanCommand({
                TableName: "Connections",
                FilterExpression: "chatId = :chatId",
                ExpressionAttributeValues: { ":chatId": { S: chatId } },
            }));
        
            console.log("Scan result:", JSON.stringify(connectionsData, null, 2));
        
            if (!connectionsData.Items || connectionsData.Items.length === 0) {
                console.warn("No active WebSocket connections found for chat:", chatId);
                return { statusCode: 200, body: "No active connections" };
            }
        } catch (err) {
            console.error("Error scanning Connections table:", err);
        }

        // Send message to all connected clients (including sender)
        const sendPromises = connectionsData.Items.map(async ({ connectionId }) => {
            console.log(`Sending message to connectionId: ${connectionId.S}`);  // Check
            return sendToClient(connectionId.S, { chatId, senderId, text });
        });

        await Promise.all(sendPromises);
        console.log("All messages sent to WebSocket clients");  // Check

        // Publish message to SNS for further processing (recipient delivery)
        // Check
        const snsMessage = { chatId, senderId, text };
        console.log("Publishing message to SNS:", JSON.stringify(snsMessage));
        
        await snsClient.send(new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: JSON.stringify({ chatId, senderId, text }),
        }));
        

        console.log("Message published to SNS successfully");   // Check
        return { statusCode: 200, body: JSON.stringify({ messageId }) };
    } catch (err) {
        console.error("Error in sendMessage:", err);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};