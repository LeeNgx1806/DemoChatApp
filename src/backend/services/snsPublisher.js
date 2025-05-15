// const AWS = require("aws-sdk");
// const sns = new AWS.SNS();
// exports.publishMessage = async (message) => {
//   return sns.publish({ Message: JSON.stringify(message), TopicArn: process.env.CHAT_TOPIC_ARN }).promise();
// };

// // const AWS = require("aws-sdk");
// import AWS from "aws-sdk";
// const sns = new AWS.SNS();

// exports.publishMessage = async (message) => {
//     await sns.publish({
//         TopicArn: process.env.SNS_TOPIC_ARN,
//         Message: JSON.stringify(message),
//     }).promise();
// };

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// Create an SNS client
const snsClient = new SNSClient();

export const publishMessage = async (message) => {
    await snsClient.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: JSON.stringify(message),
    }));
};

