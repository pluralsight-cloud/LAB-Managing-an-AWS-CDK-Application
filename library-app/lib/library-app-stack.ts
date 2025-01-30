import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';

export class LibraryAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.TableV2(this, 'Library', {
      partitionKey: { name: 'book', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM role for Lambda functions
    const apiLambdaRole = new iam.Role(this, 'APILambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ],
    });

    // Lambda PUT function
    const putFunction = new lambda.Function(this, 'LibraryPUT', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/add-book'),
      role: apiLambdaRole,
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    // Lambda GET function
    const getFunction = new lambda.Function(this, 'LibraryGET', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/get-book'),
      role: apiLambdaRole,
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    // Lambda DELETE function
    const deleteFunction = new lambda.Function(this, 'LibraryDELETE', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/delete-book'),
      role: apiLambdaRole,
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

    // Grant DynamoDB permissions to the Lambda functions
    table.grantReadWriteData(putFunction);
    table.grantReadWriteData(getFunction);
    table.grantReadWriteData(deleteFunction);
    
    // API Gateway setup
    const libraryPUTIntegration = new HttpLambdaIntegration('LibraryPUTIntegration', putFunction);
    const libraryGETIntegration = new HttpLambdaIntegration('LibraryGETIntegration', getFunction);
    const libraryDELETEIntegration = new HttpLambdaIntegration('LibraryDELETEIntegration', deleteFunction);

    const libraryApi = new apigatewayv2.HttpApi(this, 'LibraryAPI', {
      apiName: 'Library API'
    });

    // API Gateway routes
    // GET - Retreive all books
    libraryApi.addRoutes ({
      path: '/books',
      methods: [ apigatewayv2.HttpMethod.GET],
      integration: libraryGETIntegration
    })

    // PUT - Add book
    libraryApi.addRoutes ({
      path: '/books',
      methods: [ apigatewayv2.HttpMethod.PUT],
      integration: libraryPUTIntegration
    })

    // GET - Retreive single book
    libraryApi.addRoutes ({
      path: '/books/{book}',
      methods: [ apigatewayv2.HttpMethod.GET],
      integration: libraryGETIntegration
    })

    // DELETE - Remove book
    libraryApi.addRoutes ({
      path: '/books/{book}',
      methods: [ apigatewayv2.HttpMethod.DELETE],
      integration: libraryDELETEIntegration
    })

    // Output API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: libraryApi.apiEndpoint,
      description: 'The URL of the API Gateway',
    });

  }
}
