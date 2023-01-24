const mockGetOrElse = jest.fn();
const mockWriteFileSync = jest.fn();
const mockReaddirSync = jest.fn();
const mockReadFileSync = jest.fn();
const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();
const mockResolve = jest.fn();
const mockParse = jest.fn();
const mockParseEip = jest.fn();
const mockParseS3Bucket = jest.fn();
const mockParseSqsQueue = jest.fn();
const mockParseNatGateway = jest.fn();
const mockParseRoute = jest.fn();
const mockParseRouteTable = jest.fn();
const mockParseRouteTableAssociation = jest.fn();
const mockParseSubnet = jest.fn();
const mockParseVpc = jest.fn();

jest.mock('cached', () => (() => ({
  getOrElse: mockGetOrElse
})));

jest.mock('fs', () => {
  const original = jest.requireActual('fs');
  return {
    writeFileSync: mockWriteFileSync,
    readdirSync: mockReaddirSync,
    readFileSync: mockReadFileSync,
    existsSync: mockExistsSync,
    mkdirSync: mockMkdirSync,
    realRFS: original.readFileSync
  };
});

jest.mock('path', () => {
  const original = jest.requireActual('path');
  return {
    resolve: mockResolve,
    realResolve: original.resolve
  };
});

jest.mock('@cdktf/hcl2json', () => ({
  parse: mockParse
}));

jest.mock('../src/hashicorp-aws', () => ({
  parseEip: mockParseEip,
  parseS3Bucket: mockParseS3Bucket,
  parseSqsQueue: mockParseSqsQueue,
  parseNatGateway: mockParseNatGateway,
  parseRoute: mockParseRoute,
  parseRouteTable: mockParseRouteTable,
  parseRouteTableAssociation: mockParseRouteTableAssociation,
  parseSubnet: mockParseSubnet,
  parseVpc: mockParseVpc
}));

import { TfDiff } from '@tinystacks/precloud';
import { TinyStacksTerraformResourceParser } from '../src';

const fs = require('fs');
const path = require('path');

const mockTfFile = fs.realRFS(path.realResolve(__dirname, './test-data/main.tf'));
const mockTfJson = require('./test-data/tf-json.json');
const mockTfPlan = require('./test-data/plan.json');

const mockTfFiles = [
  {
    name: 'main.tf',
    contents: mockTfFile.toString()
  }
];

describe('Tinystacks Resource Parser', () => {
  beforeEach(() => {
    mockGetOrElse.mockResolvedValueOnce(mockTfFiles);
    mockGetOrElse.mockResolvedValueOnce(mockTfJson);
  });
  afterEach(() => {
    // for mocks
    jest.resetAllMocks();
    // for spies
    jest.restoreAllMocks();
  });
  describe('parseResource', () => {
    const parser = new TinyStacksTerraformResourceParser();
    it('returns undefined if there is no parser for the resource type', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'unknown_resource_type',
        address: 'unknown_resource_type.unknown_resource',
        logicalId: 'unknown_resource'
      };
      
      const parsedResource = await parser.parseResource(mockDiff, mockTfPlan);
  
      expect(parsedResource).toBeUndefined();
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses EIP', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_eip',
        address: 'aws_eip.ts_aws_eip_nat',
        logicalId: 'ts_aws_eip_nat'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseEip).toBeCalled();
      expect(mockParseEip).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses S3 bucket', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_s3_bucket',
        address: 'aws_s3_bucket.test_bucket',
        logicalId: 'test_bucket'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseS3Bucket).toBeCalled();
      expect(mockParseS3Bucket).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses Sqs Queue', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_sqs_queue',
        address: 'aws_sqs_queue.test_queue',
        logicalId: 'test_queue'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseSqsQueue).toBeCalled();
      expect(mockParseSqsQueue).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses Nat Gateway', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_nat_gateway',
        address: 'aws_nat_gateway.ts_aws_nat_gateway',
        logicalId: 'ts_aws_nat_gateway'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseNatGateway).toBeCalled();
      expect(mockParseNatGateway).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses Route', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_route',
        address: 'aws_route.ts_aws_route_private_ngw',
        logicalId: 'ts_aws_route_private_ngw'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseRoute).toBeCalled();
      expect(mockParseRoute).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses Route Table', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_route_table',
        address: 'aws_route_table.ts_aws_route_table_private_ngw',
        logicalId: 'ts_aws_route_table_private_ngw'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseRouteTable).toBeCalled();
      expect(mockParseRouteTable).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses Route Table Association', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_route_table_association',
        address: 'aws_route_table_association.ts_aws_route_table_association_private_ngw',
        logicalId: 'ts_aws_route_table_association_private_ngw'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseRouteTableAssociation).toBeCalled();
      expect(mockParseRouteTableAssociation).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses Subnet', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_subnet',
        address: 'aws_subnet.ts_aws_subnet_private_ngw',
        logicalId: 'ts_aws_subnet_private_ngw'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseSubnet).toBeCalled();
      expect(mockParseSubnet).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseVpc).not.toBeCalled();
    });
    it('parses Vpc', async () => {
      const mockDiff: TfDiff = {
        action: 'create',
        resourceType: 'aws_vpc',
        address: 'aws_vpc.ts_aws_vpc',
        logicalId: 'ts_aws_vpc'
      };
      
      await parser.parseResource(mockDiff, mockTfPlan);
      
      expect(mockParseVpc).toBeCalled();
      expect(mockParseVpc).toBeCalledWith(
        mockDiff,
        mockTfPlan,
        mockTfFiles,
        mockTfJson
      );
  
      expect(mockParseEip).not.toBeCalled();
      expect(mockParseS3Bucket).not.toBeCalled();
      expect(mockParseSqsQueue).not.toBeCalled();
      expect(mockParseNatGateway).not.toBeCalled();
      expect(mockParseRoute).not.toBeCalled();
      expect(mockParseRouteTable).not.toBeCalled();
      expect(mockParseRouteTableAssociation).not.toBeCalled();
      expect(mockParseSubnet).not.toBeCalled();
    });
  });
  it('getTfFiles', () => {
    mockResolve.mockReturnValueOnce('./');
    mockReaddirSync.mockReturnValueOnce([
      'main.tf',
      'secondary.tf',
      'outputs.tf',
      'variables.tf',
      'vars.auto.tfvars'
    ]);
    mockReadFileSync.mockImplementation(fileName => `${fileName} contents`);

    const parser = new TinyStacksTerraformResourceParser();
    const result = parser.getTfFiles();

    expect(mockResolve).toBeCalledTimes(1);
    expect(mockReaddirSync).toBeCalledTimes(1);
    expect(mockReadFileSync).toBeCalledTimes(2);
    expect(result).toEqual([
      {
        name: 'main.tf',
        contents: 'main.tf contents'
      },
      {
        name: 'secondary.tf',
        contents: 'secondary.tf contents'
      }
    ]);
  });
  it('getTfJson', async () => {
    const tfFiles = [
      {
        name: 'main.tf',
        contents: 'main.tf contents'
      },
      {
        name: 'secondary.tf',
        contents: 'secondary.tf contents'
      }
    ];
    mockParse.mockImplementation(() => ({}));


    const parser = new TinyStacksTerraformResourceParser();
    const result = await parser.getTfJson(tfFiles);

    expect(mockParse).toBeCalledTimes(2);
    expect(result).toEqual([
      {
        name: 'main.tf',
        contents: {}
      },
      {
        name: 'secondary.tf',
        contents: {}
      }
    ]);
  });
});