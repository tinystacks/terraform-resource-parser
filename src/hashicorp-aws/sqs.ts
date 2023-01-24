import { TfDiff, Json, TxtFile, JsonFile } from '@tinystacks/precloud';
import { getTfEntry, resolveValue } from './helpers';
import { dontReturnEmpty } from '../utils';

// https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_CreateQueue.html
function parseSqsQueue (diff: TfDiff, tfPlan: Json, _tfFiles: TxtFile[], tfJson: JsonFile[]): Json {
  const tfEntry = getTfEntry(diff, tfJson);
  const queueName = resolveValue(diff, tfPlan, tfEntry, 'name');
  const tags = resolveValue(diff, tfPlan, tfEntry, 'tags');
  const attributes = Object.fromEntries(
    Object.entries<Json>(tfEntry || {})
      .filter(([propertyName]) => propertyName !== 'name' && propertyName !== 'tags')
      .map(([propertyName]) => [propertyName, resolveValue(diff, tfPlan, tfEntry, propertyName)])
  );
  const properties = {
    QueueName: queueName,
    Tags: tags,
    Attributes: attributes
  };
  return dontReturnEmpty(properties);
}

export {
  parseSqsQueue
};