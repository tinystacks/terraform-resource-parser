import * as fs from 'fs';
import * as path from 'path';
import { TfDiff } from '@tinystacks/precloud';
import { parseS3Bucket, s3TagMapper } from '../../src/hashicorp-aws';

const mockTfFile = fs.readFileSync(path.resolve(__dirname, '../test-data/main.tf')).toString();
const mockTfJson = require('../test-data/tf-json.json');
const mockTfPlan = require('../test-data/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile
  }
];

describe('Terraform S3 Resource Parser Tests', () => {
  it('parseS3Bucket', () => {
    const mockDiff: TfDiff = {
      action: 'create',
      resourceType: 'aws_s3_bucket',
      address: 'aws_s3_bucket.ts_bucket',
      logicalId: 'ts_bucket'
    };

    const parsedBucket = parseS3Bucket(mockDiff, mockTfPlan, mockTfFiles, mockTfJson);

    expect(parsedBucket).toHaveProperty('Name', 'smoke-test-bucket');
  });
});

describe('S3 tag mapper', () => {
  it ('converts tags correctly', () => {
    const tag = ['key', 'value'];
    expect(s3TagMapper(tag)).toStrictEqual({Key: 'key', Value: 'value'});
  })
});