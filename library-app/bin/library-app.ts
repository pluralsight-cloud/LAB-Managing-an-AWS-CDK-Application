#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LibraryAppStack } from '../lib/library-app-stack';

const app = new cdk.App();
new LibraryAppStack(app, 'LibraryAppStack', { });
