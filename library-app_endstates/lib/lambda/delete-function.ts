import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DeleteLambdaFunction extends Construct {

  public readonly deleteFunction: lambda.Function;

  constructor(scope: Construct, id: string, role: iam.Role, table: dynamodb.TableV2) {
    super(scope, id);

    this.deleteFunction = new lambda.Function(this, 'LibraryDELETE', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/delete-book'),
      role: role,
      environment: {
        TABLE_NAME: table.tableName,
      }
    });

  }
}