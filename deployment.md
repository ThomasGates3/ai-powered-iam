# Deployment Guide - AI-Powered IAM Policy Generator

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Configuration](#configuration)
4. [Build & Deployment](#build--deployment)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### AWS Account Requirements
- AWS Account with appropriate IAM permissions
- AWS CLI v2 installed and configured
- Access to the following services:
  - Lambda
  - API Gateway
  - Bedrock
  - VPC/EC2
  - CloudWatch
  - Secrets Manager
  - S3
  - CloudFront
  - IAM

### Local Machine Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.12 or higher
- **Git**: v2.30 or higher
- **AWS CDK**: v2.x (install via `npm install -g aws-cdk`)

### AWS Service Enablement
```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Ensure Bedrock is enabled in your region
aws bedrock describe-foundation-models --region us-east-1
```

---

## Environment Setup

### 1. Clone and Initialize Repository

```bash
cd /Users/tg3/dev/ai-powered-iam
git clone <repo-url> .  # If not already cloned
git init
```

### 2. Install Dependencies

#### Node.js/npm Dependencies
```bash
npm install
npm install -g aws-cdk
```

#### Python Dependencies (for Lambda)
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure AWS Credentials

```bash
# Option 1: AWS CLI configuration
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=<your-access-key>
export AWS_SECRET_ACCESS_KEY=<your-secret-key>
export AWS_REGION=us-east-1

# Option 3: IAM roles (recommended for production)
# Assign IAM role to EC2 instance or container
```

### 4. Verify AWS Access

```bash
# Check AWS CLI access
aws sts get-caller-identity

# Verify Bedrock access
aws bedrock describe-foundation-models --region us-east-1 | grep "claude-3-5-sonnet"
```

---

## Configuration

### 1. Environment Variables

Create `.env` file in project root (do not commit):

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<your-account-id>

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Application Configuration
ENVIRONMENT=dev  # dev, staging, prod
LOG_LEVEL=INFO
API_RATE_LIMIT=10  # requests per second
API_KEY_REQUIRED=false  # true for production
```

### 2. CDK Context Variables

Update `cdk.json`:

```json
{
  "context": {
    "environment": "dev",
    "projectName": "iam-policy-generator",
    "vpc": {
      "cidr": "10.0.0.0/16",
      "maxAzs": 2
    },
    "lambda": {
      "memory": 1024,
      "timeout": 10,
      "reservedConcurrency": 50
    },
    "bedrock": {
      "modelId": "anthropic.claude-3-5-sonnet-20241022-v2:0",
      "region": "us-east-1"
    },
    "cloudwatch": {
      "logRetentionDays": 7
    },
    "tags": {
      "Project": "IAMPolicyGenerator",
      "Environment": "dev",
      "CostCenter": "Engineering"
    }
  }
}
```

### 3. Lambda Environment Variables

These are set via CDK and passed to Lambda at runtime:

```python
environment={
    'BEDROCK_MODEL_ID': context['bedrock']['modelId'],
    'BEDROCK_REGION': context['bedrock']['region'],
    'LOG_LEVEL': os.getenv('LOG_LEVEL', 'INFO'),
}
```

---

## Build & Deployment

### 1. Synthesize CDK Stack

```bash
# Validate CDK stack (generates CloudFormation template)
cdk synth

# Expected output:
# ✓ CDK synthesis complete (no errors)
```

### 2. Bootstrap AWS Account (First Time Only)

```bash
# Bootstrap AWS account for CDK
cdk bootstrap aws://<ACCOUNT-ID>/us-east-1

# Expected output:
# 1. Creating CloudFormation stack for CDK bootstrap...
# ✓ CDK bootstrap complete
```

### 3. Build Lambda Function

```bash
# Install Python dependencies in lambda layer
mkdir -p lambda/python
pip install -r requirements.txt -t lambda/python

# Expected output:
# ✓ Dependencies installed to lambda/python
```

### 4. Deploy Stack

```bash
# Dry-run (preview changes)
cdk diff

# Deploy to AWS
cdk deploy --all

# Expected output:
# 1. Creating S3 bucket for frontend...
# /iam-policy-generator-frontend-123456789012
# ✓ S3 bucket created

# 2. Creating VPC and private subnets...
# ✓ VPC created: vpc-abc123def456
# ✓ Private Subnet 1: subnet-abc123 (10.0.1.0/24)
# ✓ Private Subnet 2: subnet-def456 (10.0.2.0/24)

# 3. Creating VPC Endpoints...
# ✓ Bedrock VPC Endpoint: vpce-abc123
# ✓ CloudWatch Logs VPC Endpoint: vpce-def456
# ✓ Secrets Manager VPC Endpoint: vpce-ghi789

# 4. Creating Lambda function...
# ✓ Lambda function created: iam-policy-generator

# 5. Creating API Gateway...
# ✓ API Gateway created: https://abc123def456.execute-api.us-east-1.amazonaws.com/prod

# 6. Creating CloudWatch resources...
# ✓ Log group created: /aws/lambda/iam-policy-generator
# ✓ Alarms configured

# ✓ Stack deployment complete
# Outputs:
#   FrontendUrl: https://d1234567890.cloudfront.net
#   ApiEndpoint: https://abc123def456.execute-api.us-east-1.amazonaws.com/prod
```

### 5. Deploy Frontend

```bash
# Build React frontend
npm run build:frontend

# Upload to S3
aws s3 sync dist/frontend s3://iam-policy-generator-frontend-123456789012/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id D1234567890 --paths "/*"

# Expected output:
# ✓ Frontend build complete
# ✓ Frontend deployed to S3
# ✓ CloudFront cache invalidated
```

---

## Verification

### 1. Check Stack Status

```bash
# List deployed stacks
aws cloudformation describe-stacks --region us-east-1

# Expected: Stack status should be CREATE_COMPLETE or UPDATE_COMPLETE
```

### 2. Verify AWS Resources

```bash
# Check Lambda function
aws lambda get-function --function-name iam-policy-generator --region us-east-1

# Check API Gateway
aws apigateway get-rest-apis --region us-east-1

# Check VPC and subnets
aws ec2 describe-vpcs --region us-east-1 | grep "IamPolicy"
aws ec2 describe-subnets --region us-east-1

# Check VPC Endpoints
aws ec2 describe-vpc-endpoints --region us-east-1

# Expected: All resources should be in available/active state
```

### 3. Test API Endpoint

```bash
# Get API endpoint from CDK outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name IamPolicyGeneratorStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text \
  --region us-east-1)

# Test policy generation
curl -X POST "$API_ENDPOINT/generate-policy" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Lambda function needs read-only access to S3 bucket data-lake"
  }'

# Expected response:
# {
#   "policy": {
#     "Version": "2012-10-17",
#     "Statement": [...]
#   },
#   "explanation": "...",
#   "warnings": []
# }
```

### 4. Check CloudWatch Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/iam-policy-generator --follow --region us-east-1

# Expected: Recent function invocations with successful execution
```

### 5. Test Frontend

```bash
# Get frontend URL from CDK outputs
FRONTEND_URL=$(aws cloudformation describe-stacks \
  --stack-name IamPolicyGeneratorStack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
  --output text \
  --region us-east-1)

# Open in browser
open $FRONTEND_URL

# Expected: IAM Policy Generator UI loads successfully
```

### 6. Performance Test (Optional)

```bash
# Generate 10 policies and measure response time
for i in {1..10}; do
  time curl -X POST "$API_ENDPOINT/generate-policy" \
    -H "Content-Type: application/json" \
    -d '{"description": "Lambda needs S3 read access"}' > /dev/null
done

# Expected: Average response time < 3 seconds
```

---

## Troubleshooting

### Issue: CDK Bootstrap Fails

**Error**: `User is not authorized to perform: cloudformation:CreateStack`

**Solution**:
```bash
# Ensure your IAM user/role has CloudFormation permissions
# Add these policies to your IAM user:
# - CloudFormationFullAccess
# - IAMFullAccess
# - EC2FullAccess
# - S3FullAccess

# Then retry bootstrap
cdk bootstrap aws://<ACCOUNT-ID>/us-east-1
```

### Issue: Lambda Timeout (> 3 seconds)

**Error**: Lambda invocations timing out

**Solution**:
```bash
# Check if cold start is causing delays
aws logs tail /aws/lambda/iam-policy-generator --follow

# If cold starts > 1s, enable provisioned concurrency
aws lambda put-provisioned-concurrency-config \
  --function-name iam-policy-generator \
  --provisioned-concurrent-executions 2 \
  --region us-east-1

# Or increase Lambda memory (scales CPU)
cdk deploy --context lambda:memory=2048
```

### Issue: Bedrock API Errors

**Error**: `ThrottlingException` or `ResourceNotFoundException`

**Solution**:
```bash
# Verify Bedrock access in your region
aws bedrock describe-foundation-models --region us-east-1

# If model not found, enable Bedrock in the console:
# AWS Console > Bedrock > Model Access > Request Access for Claude 3.5 Sonnet

# Check Bedrock quota limits
aws service-quotas get-service-quota \
  --service-code bedrock \
  --quota-code L-BEDROCK-TOKEN-PER-HOUR \
  --region us-east-1
```

### Issue: VPC Endpoint Not Resolving

**Error**: `Connection timeout` when Lambda calls Bedrock

**Solution**:
```bash
# Check VPC endpoint DNS
aws ec2 describe-vpc-endpoints \
  --region us-east-1 \
  --filters "Name=service-name,Values=com.amazonaws.us-east-1.bedrock-runtime" \
  --query 'VpcEndpoints[0].{Id:VpcEndpointId,State:State,PrivateDnsEnabled:PrivateDnsNameOptions.PrivateDnsNameEnabled}'

# If PrivateDnsEnabled is false, enable it:
aws ec2 modify-vpc-endpoint \
  --vpc-endpoint-id vpce-abc123 \
  --private-dns-enabled \
  --region us-east-1
```

### Issue: CORS Errors in Frontend

**Error**: `Access-Control-Allow-Origin` error when calling API

**Solution**:
```bash
# Verify API Gateway CORS configuration
aws apigateway get-integration-response \
  --rest-api-id abc123def456 \
  --resource-id xyz789 \
  --http-method POST \
  --status-code 200 \
  --region us-east-1

# If CORS not configured, redeploy with CORS enabled
cdk deploy --context enableCors=true
```

### Issue: High Lambda Costs

**Error**: Unexpected AWS charges due to Lambda/Bedrock usage

**Solution**:
```bash
# Check Lambda invocation count
aws logs insights query \
  --log-group-name /aws/lambda/iam-policy-generator \
  --start-time $(date -d '7 days ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp | stats count() as invocations by @timestamp'

# Set Lambda reserved concurrency to cap costs
aws lambda put-function-concurrency \
  --function-name iam-policy-generator \
  --reserved-concurrent-executions 10 \
  --region us-east-1

# Monitor Bedrock token usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name TokensUsed \
  --start-time $(date -d '7 days ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region us-east-1
```

---

## Rollback Procedures

### Option 1: Revert Last Deployment (Git)

```bash
# View deployment history
git log --oneline -10

# Revert to previous commit
git revert HEAD

# Deploy previous version
cdk deploy --all
```

### Option 2: CloudFormation Stack Rollback

```bash
# View stack events
aws cloudformation describe-stack-events \
  --stack-name IamPolicyGeneratorStack \
  --region us-east-1

# Rollback to previous stack state
aws cloudformation continue-update-rollback \
  --stack-name IamPolicyGeneratorStack \
  --region us-east-1

# Expected output:
# ✓ Stack rollback initiated
```

### Option 3: Destroy Stack (Full Cleanup)

```bash
# WARNING: This deletes all resources!
cdk destroy --all

# Confirm destruction
# (Type 'y' to confirm)

# Expected output:
# 1. Deleting API Gateway...
# ✓ API Gateway deleted

# 2. Deleting Lambda function...
# ✓ Lambda function deleted

# 3. Deleting VPC and subnets...
# ✓ VPC deleted

# ... (all resources cleaned up)
```

### Option 4: Quick Rollback (Lambda Code Only)

```bash
# If only Lambda code changed, redeploy from previous commit
git checkout HEAD~1 -- src/backend/lambda/

# Update Lambda function code
aws lambda update-function-code \
  --function-name iam-policy-generator \
  --zip-file fileb://lambda.zip \
  --region us-east-1

# Wait for update to complete
aws lambda wait function-updated \
  --function-name iam-policy-generator \
  --region us-east-1

# Verify new version
aws lambda get-function \
  --function-name iam-policy-generator \
  --region us-east-1
```

---

## Post-Deployment Checklist

- [ ] All CloudFormation outputs captured (API endpoint, frontend URL)
- [ ] Frontend loads without errors
- [ ] API responds to test requests
- [ ] CloudWatch logs show successful invocations
- [ ] CloudWatch alarms configured and tested
- [ ] Security groups verified (least-privilege)
- [ ] VPC endpoints functional
- [ ] Cost monitoring set up (billing alerts)
- [ ] Backup/disaster recovery plan documented
- [ ] Team trained on deployment process

---

## Support & Escalation

**For deployment issues**:
1. Check [troubleshooting](#troubleshooting) section
2. Review CloudWatch Logs: `/aws/lambda/iam-policy-generator`
3. Check AWS service status: https://status.aws.amazon.com
4. Open GitHub issue: https://github.com/your-org/ai-powered-iam/issues

**For AWS-specific issues**:
- AWS Support: https://console.aws.amazon.com/support
- Bedrock Documentation: https://docs.aws.amazon.com/bedrock
- Lambda Documentation: https://docs.aws.amazon.com/lambda
