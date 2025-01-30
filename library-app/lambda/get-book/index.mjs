import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME || 'library';

export const handler = async (event) => {
  try {
    const result = await handleRequest(event);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

const handleRequest = async (event) => {
  if (event.pathParameters && event.pathParameters.book) {
    // Query by "book"
    const { book } = event.pathParameters;
    const response = await dynamo.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "book = :book",
        ExpressionAttributeValues: {
          ":book": book,
        },
      })
    );
    return response.Items || [];
  } else {
    // Scan entire table
    const response = await dynamo.send(
      new ScanCommand({ TableName: tableName })
    );
    return response.Items || [];
  }
};