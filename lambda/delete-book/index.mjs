import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || "library2";

const deleteBook = async (bookTitle) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { book: bookTitle },
  };

  await dynamo.send(new DeleteCommand(params));
};

export const handler = async (event) => {
  try {
    const { book } = event.pathParameters; // Assuming `book` is the path parameter

    if (!book) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Book title is required in path parameters." }),
      };
    }

    await deleteBook(book);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Deleted book: ${book}` }),
    };
  } catch (error) {
    console.error("Error deleting book:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An error occurred while deleting the book.",
        details: error.message,
      }),
    };
  }
};
