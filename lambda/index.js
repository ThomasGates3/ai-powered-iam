// Simplified Lambda handler - uses AWS SDK v3 (DynamoDB) and OpenRouter API
const { DynamoDBClient, PutItemCommand, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

// For UUID generation without external dependency
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const region = process.env.REGION || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = 'anthropic/claude-3.5-haiku';
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'iam-policies';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Generate IAM policy using OpenRouter Claude
async function generatePolicyWithOpenRouter(description) {
  const prompt = `You are an AWS IAM security expert. Based on the user's description, generate a least-privilege IAM policy in valid JSON format.

User request: ${description}

Generate a valid IAM policy JSON object. Respond ONLY with valid JSON, no explanations or markdown formatting. The policy should follow AWS IAM policy format. Example:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::bucket-name/*"
    }
  ]
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
    }

    const responseBody = await response.json();
    const policyText = responseBody.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = policyText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract valid JSON from OpenRouter response');
    }

    const policy = JSON.parse(jsonMatch[0]);
    return JSON.stringify(policy);
  } catch (error) {
    console.error('OpenRouter error:', error);
    throw new Error(`Failed to generate policy: ${error.message}`);
  }
}

// Store policy in DynamoDB
async function storePolicy(policyId, description, policyJson, timestamp) {
  try {
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
  } catch (error) {
    console.error('DynamoDB store error:', error);
    throw new Error(`Failed to store policy: ${error.message}`);
  }
}

// Get all policies
async function getAllPolicies() {
  try {
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
  } catch (error) {
    console.error('DynamoDB scan error:', error);
    throw new Error(`Failed to fetch policies: ${error.message}`);
  }
}

// Delete policy
async function deletePolicy(policyId) {
  try {
    const params = {
      TableName: DYNAMODB_TABLE,
      Key: {
        policy_id: { S: policyId },
      },
    };

    const command = new DeleteItemCommand(params);
    await dynamoClient.send(command);
  } catch (error) {
    console.error('DynamoDB delete error:', error);
    throw new Error(`Failed to delete policy: ${error.message}`);
  }
}

// Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight - must be handled at top level
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  if (method === 'OPTIONS' || !event.rawPath || event.rawPath === '/' || !event.rawPath.includes('/policies')) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({}),
    };
  }

  try {
    const path = event.rawPath || event.path || '/';

    console.log(`Method: ${method}, Path: ${path}`);

    // POST /policies - Generate new policy
    if (method === 'POST' && path.includes('/policies')) {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      const { description } = body;

      console.log(`Generating policy for: ${description}`);

      if (!description || !description.trim()) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Description is required' }),
        };
      }

      // Generate policy with OpenRouter
      console.log('Calling OpenRouter...');
      const policyJson = await generatePolicyWithOpenRouter(description);
      console.log('OpenRouter response received');

      // Store in DynamoDB
      const policyId = generateUUID();
      const timestamp = new Date().toISOString();

      console.log(`Storing policy ${policyId} in DynamoDB...`);
      await storePolicy(policyId, description, policyJson, timestamp);
      console.log('Policy stored successfully');

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
      console.log('Fetching all policies...');
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
      console.log(`Deleting policy ${policyId}...`);

      if (!policyId) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Policy ID is required' }),
        };
      }

      await deletePolicy(policyId);
      console.log('Policy deleted successfully');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Policy deleted' }),
      };
    }

    // Not found
    console.log('Route not found');
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
        message: error.message || String(error),
      }),
    };
  }
};
