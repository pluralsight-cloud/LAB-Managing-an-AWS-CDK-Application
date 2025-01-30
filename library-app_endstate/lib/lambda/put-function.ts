import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class PutLambdaFunction extends Construct {

  public readonly putFunction: lambda.Function;

  constructor(scope: Construct, id: string, role: iam.Role, table: dynamodb.TableV2) {
    super(scope, id);

    this.putFunction = new lambda.Function(this, 'LibraryPUT', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/add-book'),
      role: role,
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

  }
}