import json
import boto3
import os
import logging
from datetime import datetime

# Initialize clients
bedrock = boto3.client('bedrock-runtime')
logger = logging.getLogger()

# Configuration
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-5-sonnet-20241022-v2:0')
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
logger.setLevel(LOG_LEVEL)

SYSTEM_PROMPT = """You are an AWS IAM policy expert. Generate least-privilege IAM policies in JSON format.

Rules:
1. Use specific actions (no wildcards like s3:* unless explicitly requested)
2. Use full resource ARNs when resource names are provided
3. Include condition keys for additional security (VPC endpoints, tags, encryption)
4. Output ONLY valid JSON (AWS IAM Policy format, version 2012-10-17)
5. Use "Effect": "Allow" only (no Deny statements in MVP)
6. Add descriptive Sid values for each statement
7. Structure statements logically by AWS service/action type

Example Input: "Lambda function needs to read from S3 bucket 'data-lake'"
Example Output:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadFromDataLakeBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::data-lake",
        "arn:aws:s3:::data-lake/*"
      ]
    }
  ]
}"""


def handler(event, context):
    """Lambda handler for IAM policy generation"""
    request_id = context.request_id

    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        description = body.get('description', '').strip()

        if not description:
            logger.warning(f"[{request_id}] Empty description provided")
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Description is required',
                    'message': 'Please provide a description of your access needs'
                })
            }

        logger.info(f"[{request_id}] Generating policy for: {description[:100]}")

        # Call Bedrock
        start_time = datetime.now()

        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-06-01',
                'max_tokens': 2048,
                'system': SYSTEM_PROMPT,
                'messages': [
                    {
                        'role': 'user',
                        'content': f'Generate an IAM policy for: {description}'
                    }
                ]
            })
        )

        # Parse Bedrock response
        response_body = json.loads(response['body'].read())
        policy_text = response_body['content'][0]['text']

        # Extract JSON from response
        policy = extract_json_from_response(policy_text)

        if not policy:
            logger.error(f"[{request_id}] Failed to extract JSON from Bedrock response")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Policy generation failed',
                    'message': 'Could not generate valid IAM policy'
                })
            }

        # Validate policy
        if not validate_policy(policy):
            logger.error(f"[{request_id}] Generated policy failed validation")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Invalid policy generated',
                    'message': 'Generated policy does not meet validation requirements'
                })
            }

        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"[{request_id}] Policy generated successfully in {duration:.2f}s")

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'policy': policy,
                'explanation': f'Generated least-privilege IAM policy with {len(policy.get("Statement", []))} statement(s)',
                'warnings': []
            })
        }

    except json.JSONDecodeError:
        logger.error(f"[{request_id}] Invalid JSON in request body")
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }


def extract_json_from_response(text):
    """Extract JSON from Bedrock response text"""
    try:
        # Try to find JSON in the response
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1

        if start_idx >= 0 and end_idx > start_idx:
            json_str = text[start_idx:end_idx]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    return None


def validate_policy(policy):
    """Validate IAM policy structure"""
    if not isinstance(policy, dict):
        return False

    if 'Version' not in policy or policy['Version'] != '2012-10-17':
        return False

    if 'Statement' not in policy or not isinstance(policy['Statement'], list):
        return False

    if len(policy['Statement']) == 0:
        return False

    # Validate each statement
    for stmt in policy['Statement']:
        if not isinstance(stmt, dict):
            return False
        if 'Effect' not in stmt or stmt['Effect'] not in ['Allow', 'Deny']:
            return False
        if 'Action' not in stmt:
            return False
        if 'Resource' not in stmt:
            return False

    return True
