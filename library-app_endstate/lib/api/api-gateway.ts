import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class LibraryAPIStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    putLambda: lambda.Function,
    getLambda: lambda.Function,
    deleteLambda: lambda.Function,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // API Gateway setup
    const libraryPutIntegration = new HttpLambdaIntegration('LibraryPUTIntegration', putLambda);
    const libraryGetIntegration = new HttpLambdaIntegration('LibraryGETIntegration', getLambda);
    const libraryDeleteIntegration = new HttpLambdaIntegration('LibraryDELETEIntegration', deleteLambda);

    const libraryApi = new apigatewayv2.HttpApi(this, 'LibraryAPI', {
      apiName: 'Library API'
    });

    // API Gateway routes
    libraryApi.addRoutes({
      path: '/books',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: libraryGetIntegration,
    });

    libraryApi.addRoutes({
      path: '/books',
      methods: [apigatewayv2.HttpMethod.PUT],
      integration: libraryPutIntegration,
    });

    libraryApi.addRoutes({
      path: '/books/{book}',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: libraryGetIntegration,
    });

    libraryApi.addRoutes({
      path: '/books/{book}',
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: libraryDeleteIntegration,
    });

    // Output API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: libraryApi.apiEndpoint,
      description: 'The URL of the API Gateway',
    });
  }
}