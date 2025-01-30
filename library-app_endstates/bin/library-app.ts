#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LibraryAppStack } from '../lib/library-app-stack';
import { LibraryDBStack } from '../lib/database/database';
import { LibraryLambdaStack } from '../lib/lambda/lambda';
import { LibraryAPIStack } from '../lib/api/api-gateway'

const app = new cdk.App();
//new LibraryAppStack(app, 'LibraryAppStack', { });

const libraryDbStack = new LibraryDBStack(app, 'LibraryDBStack');
const libraryLambdaStack = new LibraryLambdaStack(app, 'LibraryLambdaStack', libraryDbStack.table);
new LibraryAPIStack(app, 'LibraryAPIStack', 
  libraryLambdaStack.putLambda.putFunction, 
  libraryLambdaStack.getLambda.getFunction, 
  libraryLambdaStack.deleteLambda.deleteFunction
);