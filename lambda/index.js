const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand, DeleteItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

const BEDROCK_MODEL = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'iam-policies';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Generate IAM policy using Bedrock Claude
async function generatePolicyWithBedrock(description) {
  const prompt = `You are an AWS IAM security expert. Based on the user's description, generate a least-privilege IAM policy in valid JSON format.

User request: ${description}

Generate a valid IAM policy JSON object. Respond ONLY with valid JSON, no explanations or markdown formatting. The policy should follow AWS IAM policy format.`;

  const params = {
    modelId: BEDROCK_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-06-01',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  };

  const command = new InvokeModelCommand(params);
  const response = await bedrockClient.send(command);

  // Parse response
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const policyText = responseBody.content[0].text;

  // Extract JSON from response (in case there's extra text)
  const jsonMatch = policyText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract valid JSON from Bedrock response');
  }

  const policy = JSON.parse(jsonMatch[0]);
  return JSON.stringify(policy);
}

// Store policy in DynamoDB
async function storePolicy(policyId, description, policyJson, timestamp) {
  const params = {
    TableName: DYNAMODB_TABLE,
    Item: {
      policy_id: { S: policyId },
      timestamp: { S: timestamp },
      description: { S: description },
      policy_json: { S: policyJson },
      ttl: { N: String(Math.floor(Date.now() / 1000) + 7776000) }, // 90 days TTL
    },
  };

  const command = new PutItemCommand(params);
  await dynamoClient.send(command);
}

// Get all policies
async function getAllPolicies() {
  const params = {
    TableName: DYNAMODB_TABLE,
  };

  const command = new ScanCommand(params);
  const response = await dynamoClient.send(command);

  return (response.Items || []).map(item => ({
    policy_id: item.policy_id.S,
    timestamp: item.timestamp.S,
    description: item.description.S,
    policy_json: item.policy_json.S,
  }));
}

// Delete policy
async function deletePolicy(policyId) {
  const params = {
    TableName: DYNAMODB_TABLE,
    Key: {
      policy_id: { S: policyId },
    },
  };

  const command = new DeleteItemCommand(params);
  await dynamoClient.send(command);
}

// Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({}),
    };
  }

  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.rawPath || event.path || '';

    // POST /policies - Generate new policy
    if (method === 'POST' && path.includes('/policies')) {
      const body = JSON.parse(event.body || '{}');
      const { description } = body;

      if (!description || !description.trim()) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Description is required' }),
        };
      }

      // Generate policy with Bedrock
      const policyJson = await generatePolicyWithBedrock(description);

      // Store in DynamoDB
      const policyId = uuidv4();
      const timestamp = new Date().toISOString();

      await storePolicy(policyId, description, policyJson, timestamp);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          policy_id: policyId,
          timestamp,
          description,
          policy_json: policyJson,
        }),
      };
    }

    // GET /policies - Get all policies
    if (method === 'GET' && path.includes('/policies') && !path.includes('/policies/')) {
      const policies = await getAllPolicies();

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          policies: policies.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        }),
      };
    }

    // DELETE /policies/{id} - Delete policy
    if (method === 'DELETE' && path.includes('/policies/')) {
      const policyId = path.split('/').pop();

      if (!policyId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Policy ID is required' }),
        };
      }

      await deletePolicy(policyId);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Policy deleted' }),
      };
    }

    // Not found
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
