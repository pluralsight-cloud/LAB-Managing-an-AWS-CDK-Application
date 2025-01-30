import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class LambdaApiPermissions extends Construct {
  public readonly apiLambdaRole: iam.Role;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // IAM Role for Lambda functions
    const apiLambdaRole = new iam.Role(this, 'APILambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ],
    });
  }
}