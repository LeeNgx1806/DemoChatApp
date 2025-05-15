import { DynamoDBClient, QueryCommand, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export const handler = async (event) => {
    try {
        const username = event.queryStringParameters?.username;
        
        if (!username) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,user-id'
                },
                body: JSON.stringify({ message: 'Username parameter is required' })
            };
        }

        const params = {
            TableName: 'Users',
            FilterExpression: 'contains(username, :username)',
            ExpressionAttributeValues: {
                ':username': username.toLowerCase()
            }
        };

        const result = await client.send(new QueryCommand(params));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,user-id'
            },
            body: JSON.stringify(result.Items)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,user-id'
            },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
