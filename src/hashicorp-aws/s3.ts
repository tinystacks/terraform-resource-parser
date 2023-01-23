import { TfDiff, Json, TxtFile, JsonFile } from '@tinystacks/predeploy-infra';
import { getTfEntry, resolveValue } from './helpers';

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_Bucket.html
function parseS3Bucket (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const name = resolveValue(diff, tfPlan, tfEntry, 'bucket');
  const tags = resolveValue(diff, tfPlan, tfEntry, 'tags');
  const tagSet = Object.entries(tags || {}).map(([key, value]) => ({
    Key: key,
    Value: value
  }));
  return {
    Name: name,
    TagSet: tagSet
  };
}

export {
  parseS3Bucket
};