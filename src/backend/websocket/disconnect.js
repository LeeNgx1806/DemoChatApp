// exports.handler = async (event) => {
//     return { statusCode: 200, body: "Disconnected" };
//   };

// exports.handler = async (event) => {
//     const { connectionId } = event.requestContext;
//     await dynamoDB.delete({
//         TableName: "Connections",
//         Key: { connectionId },
//     }).promise();

//     return { statusCode: 200, body: "Disconnected" };
// };

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Client
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("Disconnect Event:", JSON.stringify(event));

        const { connectionId, chatId } = event.requestContext;

        await dynamoDB.send(
            new DeleteCommand({
                TableName: "Connections",
                Key: { 
                    connectionId: { S: connectionId },
                    chatId: { S: chatId},
             }
            })
        );

        return { statusCode: 200, body: "Disconnected" };
    } catch (error) {
        console.error("Error in disconnect handler:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};


