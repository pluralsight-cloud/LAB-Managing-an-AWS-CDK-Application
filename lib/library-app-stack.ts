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
    const libraryTable = new dynamodb.TableV2(this, 'Library', {
      partitionKey: { name: 'book', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM policy to work with DynamoDB
    const libraryAPIDynamoDBPolicy = new iam.ManagedPolicy(this, 'LibraryAPIDynamoDBPolicy', {
      managedPolicyName: 'LibraryAPIDynamoDBPolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:PutItem",
            "dynamodb:Scan"
          ],
          resources: [ `arn:aws:dynamodb:${this.region}:${this.account}:table/*` ]
        })
      ]
    });

    // IAM role for Lambda functions
    const libraryAPILambdaRole = new iam.Role(this, 'LibraryAPILambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        libraryAPIDynamoDBPolicy
      ],
    });

    // Lambda PUT function
    const libraryPUTFunction = new lambda.Function(this, 'LibraryPUT', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/add-book'),
      role: libraryAPILambdaRole,
      environment: {
        TABLE_NAME: libraryTable.tableName,
      }
    });

    // Lambda GET function
    const libraryGETFunction = new lambda.Function(this, 'LibraryGET', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/get-book'),
      role: libraryAPILambdaRole,
      environment: {
        TABLE_NAME: libraryTable.tableName,
      }
    });

    // Lambda DELETE function
    const libraryDELETEFunction = new lambda.Function(this, 'LibraryDELETE', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/delete-book'),
      role: libraryAPILambdaRole,
      environment: {
        TABLE_NAME: libraryTable.tableName,
      }
    });

    // Grant DynamoDB permissions to the Lambda functions
    libraryTable.grantReadWriteData(libraryPUTFunction);
    libraryTable.grantReadWriteData(libraryGETFunction);
    libraryTable.grantReadWriteData(libraryDELETEFunction);
    
    // API Gateway setup
    const libraryPUTIntegration = new HttpLambdaIntegration('LibraryPUTIntegration', libraryPUTFunction);
    const libraryGETIntegration = new HttpLambdaIntegration('LibraryGETIntegration', libraryGETFunction);
    const libraryDELETEIntegration = new HttpLambdaIntegration('LibraryDELETEIntegration', libraryDELETEFunction);

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
