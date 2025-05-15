import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID, createHash } from "crypto";

const client = new DynamoDBClient({ region: "ap-southeast-2" });

export const handler = async (event) => {
  try {
    // Validate input
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request: No body found" }),
      };
    }

    const { username, password, email } = JSON.parse(event.body);

    if (!username || !password || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email format" }),
      };
    }

    // Hash password using SHA-256 (built-in crypto module)
    const passwordHash = createHash("sha256").update(password).digest("hex");

    // Generate a secure UUID for user ID
    const userId = randomUUID();

    // Prepare DynamoDB parameters
    const params = {
      TableName: "Users",
      Item: {
        userId: { S: userId },
        username: { S: username },
        passwordHash: { S: passwordHash },
        email: { S: email },
      },
    };

    // Store in DynamoDB
    await client.send(new PutItemCommand(params));

    return {
      statusCode: 201, // Use 201 for resource creation
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all origins
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "User registered successfully", userId }),
    };
  } catch (err) {
    console.error("Error registering user:", err);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Registration failed", details: err.message }),
    };
  }
};
