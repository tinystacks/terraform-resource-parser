import cached from 'cached';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve as resolvePath  } from 'path';
import { parse } from '@cdktf/hcl2json';
import {
  Json,
  TfDiff,
  TxtFile,
  JsonFile,
  TerraformTypes,
  TerraformParser
} from '@tinystacks/precloud';
import {
  parseEip,
  parseS3Bucket,
  parseSqsQueue,
  parseNatGateway,
  parseRoute,
  parseRouteTable,
  parseRouteTableAssociation,
  parseSubnet,
  parseVpc
} from './hashicorp-aws';
import { TMP_DIRECTORY } from './constants';

const {
  TF_SQS_QUEUE,
  TF_S3_BUCKET,
  TF_EIP,
  TF_VPC,
  TF_NAT_GATEWAY,
  TF_SUBNET,
  TF_ROUTE_TABLE_ASSOCIATION,
  TF_ROUTE,
  TF_ROUTE_TABLE
} = TerraformTypes;

const fiveMinutesInSeconds = 5 * 60;


class TinyStacksTerraformResourceParser extends TerraformParser {
  tfFilesCache: any;
  resourceParsers: {
    [tfType: string]: (diff: TfDiff, tfPlan: Json, tfFiles: TxtFile[], tfJson: JsonFile[]) => Json
  } = {
      [TF_SQS_QUEUE]: parseSqsQueue,
      [TF_S3_BUCKET]: parseS3Bucket,
      [TF_EIP]: parseEip,
      [TF_VPC]: parseVpc,
      [TF_NAT_GATEWAY]: parseNatGateway,
      [TF_SUBNET]: parseSubnet,
      [TF_ROUTE_TABLE_ASSOCIATION]: parseRouteTableAssociation,
      [TF_ROUTE]: parseRoute,
      [TF_ROUTE_TABLE]: parseRouteTable
    };

  constructor () {
    super();
    this.tfFilesCache = cached('tfFiles', {
      backend: {
        type: 'memory'
      },
      defaults: {
        expire: fiveMinutesInSeconds
      }
    });
  }

  getTfFiles (): TxtFile[] {
    const files = readdirSync(resolvePath('./'));
    return files.filter(fileName => fileName.endsWith('.tf') && fileName !== 'variables.tf' && fileName !== 'outputs.tf')
      .map((name: string) => ({
        name,
        contents: readFileSync(name).toString()
      }));
  }
  
  async getTfJson (tfFiles: TxtFile[]): Promise<JsonFile[]> {
    const tfJson = [];
    for (const tfFile of tfFiles) {
      const {
        name,
        contents
      } = tfFile;
      const fileJson = await parse(name, contents);
      tfJson.push({ name, contents: fileJson });
    }
    return tfJson;
  }

  writeToTmpFile (tfJson: Json) {
    if (!existsSync(TMP_DIRECTORY)){
      mkdirSync(TMP_DIRECTORY, { recursive: true });
    }
    writeFileSync(`${TMP_DIRECTORY}/tf-json.json`, JSON.stringify(tfJson, null, 2));
  }

  async parseResource (diff: TfDiff, tfPlan: Json): Promise<Json | undefined> {
    const tfFiles = await this.tfFilesCache.getOrElse('tf-files', () => this.getTfFiles()) as TxtFile[];
    const tfJson = await this.tfFilesCache.getOrElse('tf-files-json', async () => await this.getTfJson(tfFiles)) as JsonFile[];
    this.writeToTmpFile(tfJson);
    const resourceParser = this.resourceParsers[diff.resourceType];
    if (resourceParser && !diff.address?.startsWith('module')) return resourceParser(diff, tfPlan, tfFiles, tfJson);
    return undefined;
  }
}


export {
  TinyStacksTerraformResourceParser
};
export default TinyStacksTerraformResourceParser;