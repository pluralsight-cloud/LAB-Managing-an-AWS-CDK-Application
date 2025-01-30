import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME || 'library';

export const handler = async (event) => {
  try {
    if (!event.body) {
      throw new Error("Missing request body");
    }

    const requestJSON = JSON.parse(event.body);
    let { book, author, genre, year } = requestJSON;

    if (!book || !author || !genre || !year) {
      throw new Error("Missing required fields: book, author, genre, year");
    }

    console.log("Using Table Name:", tableName);
    console.log("Request Item:", { book, author, genre, year });

    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: { book, author, genre, year },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Added book: ${book} by ${author}, ${genre}, ${year}` }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: error.message.includes("Missing") ? 400 : 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};