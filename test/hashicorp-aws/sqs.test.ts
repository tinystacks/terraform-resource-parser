import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '@tinystacks/precloud';
import { parseSqsQueue } from '../../src/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../test-data/main.tf')).toString();
const mockTfJson = require('../test-data/tf-json.json');
const mockTfPlan = require('../test-data/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform SQS Resource Parser Tests', () => {
  it('parseSqsQueue', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_sqs_queue',
      address: 'aws_sqs_queue.ts_queue',
      logicalId: 'ts_queue'
    };

    const parsedQueue = parseSqsQueue(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedQueue).toHaveProperty('QueueName', 'smoke-test-queue');
    expect(parsedQueue).toHaveProperty('Attributes', {
      'visibility_timeout': 45
    });
  });
});