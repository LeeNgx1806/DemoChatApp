import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// Initialize AWS clients
const apiClient = new ApiGatewayManagementApiClient({
    endpoint: "https://w67ljvr3fa.execute-api.ap-southeast-2.amazonaws.com/dev/",
});

const dynamoDBClient = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

export const sendToClient = async (connectionId, message) => {
    try {
        const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify(message),
        });

        await apiClient.send(command);
    } catch (error) {
        console.error(`Failed to send message to ${connectionId}:`, error);

        // Handle stale connections (WebSocket closed)
        if (error.name === "GoneException") {
            console.log(`Connection ${connectionId} is gone. Removing from DB...`);

            try {
                const chatId = message.chatId;
                await dynamoDB.send(
                    new DeleteCommand({
                        TableName: "Connections",
                        Key: { 
                            connectionId: connectionId,
                            chatId: chatId,
                        }, // Remove the stale connection
                    })
                );
                console.log(`Removed stale connection ${connectionId} from DB.`);
            } catch (dbError) {
                console.error(`Failed to remove stale connection ${connectionId}:`, dbError);
            }
        } else if (error.code === "ECONNREFUSED") {
            console.error(`Connection refused to API Gateway Management API:`, error);
            // Thực hiện các hành động phù hợp, ví dụ: gửi thông báo lỗi hoặc thử lại
        } else {
            console.error(`Unexpected error for connection ${connectionId}:`, error);
        }
    }
};


