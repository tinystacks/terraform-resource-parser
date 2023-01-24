import { TfDiff, Json, TxtFile, JsonFile } from '@tinystacks/precloud';
import { getTfEntry, resolveValue } from './helpers';

// https://docs.aws.amazon.com/AmazonS3/latest/API/API_Bucket.html
export function parseS3Bucket (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const name = resolveValue(diff, tfPlan, tfEntry, 'bucket');
  const tags = resolveValue(diff, tfPlan, tfEntry, 'tags');
  const tagSet = Object.entries(tags || {}).map(s3TagMapper);
  return {
    Name: name,
    TagSet: tagSet
  };
}

export function s3TagMapper (list: any[]) {
  return {
    Key: list[0],
    Value: list[1]
  };
}