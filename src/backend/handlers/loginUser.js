import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { createHash } from "crypto";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export const handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request: No body found" }),
      };
    }

    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const params = {
      TableName: "Users",
      FilterExpression: "username = :username",
      ExpressionAttributeValues: { ":username": { S: username } },
    };

    const response = await client.send(new ScanCommand(params));
    const user = response.Items?.[0];

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    // Hash the provided password and compare it with the stored hash
    const hashedInputPassword = createHash("sha256").update(password).digest("hex");

    if (hashedInputPassword !== user.passwordHash.S) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ userId: user.userId.S, username: user.username.S, message: "Login successful" }),
    };
  } catch (err) {
    console.error("Error logging in:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Login failed", details: err.message }),
    };
  }
};
