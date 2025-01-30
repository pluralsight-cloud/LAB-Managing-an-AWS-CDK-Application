import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { LambdaApiPermissions } from './iam';
import { PutLambdaFunction } from './put-function';
import { GetLambdaFunction } from './get-function';
import { DeleteLambdaFunction } from './delete-function';

export class LibraryLambdaStack extends cdk.Stack {

  public readonly putLambda: PutLambdaFunction;
  public readonly getLambda: GetLambdaFunction;
  public readonly deleteLambda: DeleteLambdaFunction;
  
  constructor(scope: Construct, id: string, table: dynamodb.TableV2, props?: cdk.StackProps) {
    super(scope, id, props);


    // IAM Role for Lambda
    const apiLambdaPermissions = new LambdaApiPermissions(this, 'LibraryAPILambdaPermissions');
    this.putLambda = new PutLambdaFunction(this, 'LibraryAPIPutFunction', apiLambdaPermissions.apiLambdaRole, table);
    this.getLambda = new GetLambdaFunction(this, 'LibraryAPIGetFunction', apiLambdaPermissions.apiLambdaRole, table);
    this.deleteLambda = new DeleteLambdaFunction(this, 'LibraryAPIDeleteFunction', apiLambdaPermissions.apiLambdaRole, table);

    table.grantReadWriteData(this.putLambda.putFunction);
    table.grantReadWriteData(this.getLambda.getFunction);
    table.grantReadWriteData(this.deleteLambda.deleteFunction);

  }
}