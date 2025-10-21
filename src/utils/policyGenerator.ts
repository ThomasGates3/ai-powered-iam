interface PolicyStatement {
  Effect: string;
  Action: string[];
  Resource: string;
}

interface IAMPolicy {
  Version: string;
  Statement: PolicyStatement[];
}

export async function generateIAMPolicy(description: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const lowerDesc = description.toLowerCase();
  const statements: PolicyStatement[] = [];

  if (lowerDesc.includes('s3') && lowerDesc.includes('read')) {
    statements.push({
      Effect: 'Allow',
      Action: ['s3:GetObject', 's3:ListBucket'],
      Resource: 'arn:aws:s3:::your-bucket-name/*',
    });
  }

  if (lowerDesc.includes('s3') && lowerDesc.includes('write')) {
    statements.push({
      Effect: 'Allow',
      Action: ['s3:PutObject', 's3:DeleteObject'],
      Resource: 'arn:aws:s3:::your-bucket-name/*',
    });
  }

  if (lowerDesc.includes('dynamodb') && lowerDesc.includes('read')) {
    statements.push({
      Effect: 'Allow',
      Action: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
      Resource: 'arn:aws:dynamodb:*:*:table/your-table-name',
    });
  }

  if (lowerDesc.includes('dynamodb') && lowerDesc.includes('write')) {
    statements.push({
      Effect: 'Allow',
      Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
      Resource: 'arn:aws:dynamodb:*:*:table/your-table-name',
    });
  }

  if (lowerDesc.includes('lambda') && lowerDesc.includes('invoke')) {
    statements.push({
      Effect: 'Allow',
      Action: ['lambda:InvokeFunction'],
      Resource: 'arn:aws:lambda:*:*:function:your-function-name',
    });
  }

  if (lowerDesc.includes('ec2') && lowerDesc.includes('read')) {
    statements.push({
      Effect: 'Allow',
      Action: ['ec2:DescribeInstances', 'ec2:DescribeVolumes'],
      Resource: '*',
    });
  }

  if (lowerDesc.includes('cloudwatch') && lowerDesc.includes('log')) {
    statements.push({
      Effect: 'Allow',
      Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      Resource: 'arn:aws:logs:*:*:*',
    });
  }

  if (statements.length === 0) {
    statements.push({
      Effect: 'Allow',
      Action: ['s3:GetObject', 's3:ListBucket'],
      Resource: 'arn:aws:s3:::example-bucket/*',
    });
  }

  const policy: IAMPolicy = {
    Version: '2012-10-17',
    Statement: statements,
  };

  return JSON.stringify(policy);
}
