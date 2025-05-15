// const AWS = require("aws-sdk");
// exports.handler = async (event) => {
//   console.log("Received messages", JSON.stringify(event));
//   return { statusCode: 200, body: "Messages received" };
// };

// const AWS = require("aws-sdk");
// import AWS from "aws-sdk";
// const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const websocket = require("./sendToConnection");

// exports.handler = async (event) => {
//     for (const record of event.Records) {
//         const message = JSON.parse(record.body);
//         const { chatId, senderId, text } = message;

//         // Fetch connected users from DynamoDB
//         const connections = await dynamoDB.scan({
//             TableName: "Connections",
//             FilterExpression: "chatId = :chatId",
//             ExpressionAttributeValues: { ":chatId": chatId },
//         }).promise();

//         // Send message to connected WebSocket clients
//         await Promise.all(connections.Items.map(conn =>
//             websocket.sendToClient(conn.connectionId, message)
//         ));
//     }
// };

import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { sendToClient } from "../websocket/sendToConnection.js";

const dynamoDBClient = new DynamoDBClient();

export const handler = async (event) => {
    try {
        // Parse SNS event
        const snsMessage = JSON.parse(event.Records[0].Sns.Message);
        const { chatId, senderId, text } = snsMessage;

        // Find all WebSocket connections for the chat
        const connectionsData = await dynamoDBClient.send(new ScanCommand({
            TableName: "Connections",
            FilterExpression: "chatId = :chatId",
            ExpressionAttributeValues: { ":chatId": { S: chatId } },
        }));

        // Send the message to all connected clients
        const sendPromises = connectionsData.Items.map(async ({ connectionId }) => {
            return sendToClient(connectionId.S, { chatId, senderId, text });
        });

        await Promise.all(sendPromises);

        return { statusCode: 200, body: "Message sent to recipients" };
    } catch (err) {
        console.error("Error in receiveMessage:", err);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};


