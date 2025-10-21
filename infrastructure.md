# AI-Powered IAM Policy Generator - Infrastructure Architecture

## Overview

This document details the AWS architecture, service interactions, and deployment topology for the AI-Powered IAM Policy Generator.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                          Internet                            │
└───────────────────────────┬──────────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │     CloudFront        │
                │   (CDN + Caching)     │
                └───────────┬───────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
    ┌────▼──────┐                      ┌──────▼────┐
    │  S3       │                      │API Gateway│
    │(Frontend) │                      │(REST API) │
    └────┬──────┘                      └──────┬────┘
         │                                    │
         │                         (HTTPS)    │
         │                                    │
         │                           ┌────────▼──────────────┐
         │                           │  VPC (Private)        │
         │                           │                       │
         │                           │  ┌─────────────────┐  │
         │                           │  │ Private Subnets │  │
         │                           │  │ (2 AZs)         │  │
         │                           │  │                 │  │
         │                           │  │  ┌────────────┐ │  │
         │                           │  │  │  Lambda    │ │  │
         │                           │  │  │ Execution  │ │  │
         │                           │  │  │  Env       │ │  │
         │                           │  │  └────────────┘ │  │
         │                           │  └─────────────────┘  │
         │                           │                       │
         │                           │  ┌─────────────────┐  │
         │                           │  │  VPC Endpoints  │  │
         │                           │  │                 │  │
         │                           │  │ • Bedrock       │  │
         │                           │  │ • CloudWatch    │  │
         │                           │  │ • S3            │  │
         │                           │  │ • Secrets Mgr   │  │
         │                           │  └─────────────────┘  │
         │                           └──────┬─────────────────┘
         │                                  │
         │                ┌─────────────────┼─────────────────┐
         │                │                 │                 │
    ┌────▼──────┐   ┌─────▼──────┐   ┌─────▼──────┐   ┌──────▼───┐
    │ CloudWatch│   │  Bedrock   │   │CloudWatch  │   │Secrets   │
    │    Logs   │   │ (via VPC   │   │  Metrics   │   │ Manager  │
    │(Encrypted)│   │   EP)      │   │(Custom)    │   │(API Keys)│
    └───────────┘   └────────────┘   └────────────┘   └──────────┘

```

## AWS Services & Interactions

### 1. Frontend Layer

**Service**: Amazon S3 + CloudFront + AWS Amplify

**Purpose**: Static web hosting with CDN distribution

**Components**:
- S3 bucket: `iam-policy-generator-frontend-{account-id}`
  - Stores React SPA build artifacts
  - Block public access enabled
  - Versioning enabled for rollback
  - Server-side encryption (SSE-S3)

- CloudFront Distribution:
  - Origin: S3 bucket
  - Default TTL: 1 hour (HTML), 24 hours (assets)
  - Viewer protocol policy: Redirect HTTP to HTTPS
  - Compress assets automatically
  - Cache behaviors for static assets

- AWS Amplify (optional):
  - Git-based deployment
  - Auto-deploy on code changes
  - SSL/TLS certificate management

**Data Flow**:
1. User requests web app → CloudFront CDN
2. CloudFront checks cache
3. Cache miss → routes to S3 origin
4. S3 returns HTML/CSS/JS
5. Browser loads React SPA

### 2. API Layer

**Service**: Amazon API Gateway

**Purpose**: Public REST API endpoint with request validation and authentication

**Configuration**:
- **Type**: REST API (not HTTP API for WAF integration)
- **Endpoint Type**: Regional
- **Protocol**: HTTPS only
- **Authentication**: API Key (MVP) → Cognito (post-MVP)

**Routes**:
```
POST /generate-policy
├── Request Validation
│   ├── JSON Schema validation
│   ├── Max body size: 10 KB
│   └── Content-Type: application/json
├── Throttling
│   ├── Rate limit: 10 requests/second per key
│   └── Burst limit: 20 requests
└── Lambda Integration → iam-policy-generator-lambda
```

**Security Features**:
- **CORS**: Enabled for frontend domain
- **WAF Web ACL**:
  - Rate-based rule: 100 requests per 5 minutes per IP
  - AWS Managed Rules (Core Rule Set)
  - Geo-blocking (optional)
- **Logging**: All requests logged to CloudWatch

### 3. Processing Layer

**Service**: AWS Lambda

**Purpose**: Core policy generation logic

**Function Details**:
- **Name**: `iam-policy-generator`
- **Runtime**: Python 3.12
- **Memory**: 1024 MB
- **Timeout**: 10 seconds
- **Ephemeral Storage**: 512 MB
- **Concurrency**:
  - Reserved: 50 (prevents runaway costs)
  - Provisioned: 2 (optional, for cold start mitigation)

**Execution Environment**:
- **VPC**: Private subnets (no internet access)
- **Subnets**: 2 AZs minimum
- **Security Group**:
  - Outbound HTTPS (443) to VPC endpoints only
  - No inbound rules

**Environment Variables**:
```
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_REGION=us-east-1
LOG_LEVEL=INFO
```

**Execution IAM Role** (least-privilege):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvoke",
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:*:log-group:/aws/lambda/iam-policy-generator:*"
    },
    {
      "Sid": "VPCNetworkInterfaces",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SecretsManagerRead",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:iam-policy-generator-api-key-*"
    }
  ]
}
```

**Processing Flow**:
1. API Gateway invokes Lambda with user input
2. Lambda validates input (length, content, required fields)
3. Lambda retrieves API key from Secrets Manager (optional)
4. Lambda calls Bedrock Converse API with prompt
5. Bedrock returns generated policy JSON
6. Lambda validates JSON against IAM policy schema
7. Lambda logs request/response to CloudWatch
8. Lambda returns response to API Gateway

### 4. AI Engine Layer

**Service**: Amazon Bedrock

**Purpose**: AI model inference for policy generation

**Configuration**:
- **Model**: Anthropic Claude 3.5 Sonnet
- **Model ID**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
- **API**: Bedrock Converse API (streaming-ready)
- **Pricing**: On-Demand (no provisioned throughput in MVP)

**Access Method**: VPC Endpoint (PrivateLink)

**Prompt Engineering**:
```
System Prompt:
You are an AWS IAM policy expert. Generate least-privilege IAM policies in JSON format.

Rules:
1. Use specific actions (no wildcards like s3:* unless explicitly requested)
2. Use full resource ARNs when resource names are provided
3. Include condition keys for additional security (VPC endpoints, tags, encryption)
4. Output ONLY valid JSON (AWS IAM Policy format, version 2012-10-17)
5. Use "Effect": "Allow" only (no Deny statements)
6. Add descriptive Sid values for each statement
7. Structure statements logically by AWS service/action type

User Prompt:
Generate an IAM policy for: {user_input}

Include:
- Specific actions required
- Resource ARNs
- Any relevant condition keys
- Descriptive Sid for each statement
```

**Response**:
- Valid JSON IAM policy
- Explanation (optional)
- Warnings (if any)

### 5. Storage & Secrets Layer

**Service**: AWS Secrets Manager

**Purpose**: Store API keys and configuration

**Secrets**:
- `iam-policy-generator-api-key`: Bedrock API key (if required)
- Automatic rotation: 90-day rotation policy

**Service**: AWS Systems Manager Parameter Store

**Purpose**: Store configuration parameters (optional)

### 6. Networking Layer

**Service**: Amazon VPC

**Purpose**: Private network isolation

**Components**:
- **VPC**: 10.0.0.0/16
- **Private Subnets**:
  - Subnet 1 (AZ-1): 10.0.1.0/24
  - Subnet 2 (AZ-2): 10.0.2.0/24
- **No NAT Gateway** (not needed for VPC endpoint-only access)
- **No Internet Gateway** (private only)

**VPC Endpoints** (PrivateLink):
1. **Bedrock Runtime**
   - Service: `com.amazonaws.us-east-1.bedrock-runtime`
   - Type: Interface endpoint
   - DNS: Enabled (private DNS)

2. **CloudWatch Logs**
   - Service: `com.amazonaws.us-east-1.logs`
   - Type: Interface endpoint
   - DNS: Enabled

3. **Secrets Manager** (optional)
   - Service: `com.amazonaws.us-east-1.secretsmanager`
   - Type: Interface endpoint

4. **S3**
   - Service: `com.amazonaws.us-east-1.s3`
   - Type: Gateway endpoint

**Security Groups**:
- **Lambda SG**:
  - Outbound: HTTPS (443) to VPC endpoints
  - Inbound: None

- **VPC Endpoint SG**:
  - Inbound: HTTPS (443) from Lambda SG
  - Outbound: None

### 7. Monitoring & Logging Layer

**Service**: Amazon CloudWatch

**CloudWatch Logs**:
- **Log Group**: `/aws/lambda/iam-policy-generator`
- **Retention**: 7 days (MVP) → 30 days (production)
- **Encryption**: AWS managed keys (customer-managed KMS post-MVP)

**Log Format**:
```
{
  "timestamp": "2024-10-21T10:30:45.123Z",
  "requestId": "abc123-def456",
  "userId": "user@example.com",
  "input": "Lambda function needs read access to S3 bucket 'data-lake'",
  "inputLength": 65,
  "service": "bedrock",
  "duration": 1250,
  "tokensUsed": {
    "input": 150,
    "output": 450
  },
  "policyStatements": 1,
  "errors": null,
  "statusCode": 200
}
```

**CloudWatch Metrics** (Custom):
- `PolicyGenerationDuration` (milliseconds) - histogram
- `PolicyGenerationSuccess` (count) - success/failure
- `BedrockTokensUsed` (count) - cost tracking
- `ValidationErrors` (count) - schema validation failures

**CloudWatch Alarms**:
| Alarm | Threshold | Action |
|-------|-----------|--------|
| Lambda Error Rate | > 5% (5-min) | SNS notification |
| API Gateway 5xx | > 10% (5-min) | SNS notification |
| Policy Gen Duration | > 5s (p95) | SNS notification |
| Lambda Concurrency | > 40 (80% of reserved) | SNS warning |
| Bedrock Throttling | Any detection | SNS notification |

**Service**: AWS X-Ray (optional for MVP)

**Purpose**: Distributed tracing and performance analysis

**Segments**:
- API Gateway → Lambda
- Lambda → Bedrock
- Bedrock inference time

## Data Flow Through Architecture

### Request Flow
```
1. User inputs: "Lambda needs S3 read access"
   ↓
2. Frontend (React) sends POST /generate-policy
   ↓
3. CloudFront routes to API Gateway (HTTPS)
   ↓
4. API Gateway validates request + applies WAF rules
   ↓
5. API Gateway invokes Lambda
   ↓
6. Lambda (in Private VPC)
   a. Validates input (length, content)
   b. Calls Bedrock via VPC Endpoint
   c. Receives generated policy JSON
   d. Validates JSON schema
   e. Logs to CloudWatch via VPC Endpoint
   ↓
7. Lambda returns policy JSON to API Gateway
   ↓
8. API Gateway returns response to CloudFront
   ↓
9. Frontend displays policy with copy-to-clipboard
```

### Response Latency Breakdown
| Component | Target | Notes |
|-----------|--------|-------|
| CloudFront routing | <50ms | Cache hit/miss varies |
| API Gateway | <100ms | Request validation overhead |
| Lambda cold start | <1s | Provisioned concurrency reduces this |
| Lambda init + validation | <100ms | Input parsing and schema check |
| Bedrock call | <1.5s | Model inference time |
| Lambda processing | <100ms | JSON parsing and response formatting |
| **Total (p95)** | **<3s** | Target SLA |

## Security Architecture

### Network Security
1. **Private Subnets**: No public internet access
2. **VPC Endpoints**: PrivateLink connections (AWS network only)
3. **Security Groups**: Minimal egress (HTTPS to VPC endpoints only)
4. **No NAT Gateway**: Eliminates internet routing

### Identity & Access Control
1. **Lambda IAM Role**: Least-privilege (specific resource ARNs)
2. **API Gateway Authentication**: API key validation
3. **Bedrock Access**: Scoped to specific model version
4. **Secrets Manager**: Encrypted API keys with rotation

### Data Protection
1. **Encryption In-Transit**: HTTPS/TLS 1.2+
2. **Encryption At-Rest**:
   - CloudWatch Logs: AWS managed keys
   - S3: SSE-S3
3. **No Sensitive Data Storage**: Logs purged after 7 days
4. **Input Validation**: Prevent injection attacks

### Audit & Compliance
1. **CloudTrail**: All API calls logged (optional)
2. **VPC Flow Logs**: Network traffic analysis (optional)
3. **CloudWatch Logs**: All Lambda invocations recorded
4. **Request Tracing**: Unique correlation IDs

## Scalability Architecture

### Horizontal Scaling
- **Lambda Auto-Scaling**: Automatically scales to handle concurrent requests
- **API Gateway**: Fully managed, no scaling needed
- **Bedrock**: Managed service, no scaling needed

### Vertical Scaling
- **Lambda Memory**: 1024 MB (CPU scales with memory)
- **Increase if needed**: Policy generation takes too long

### Capacity Planning
| Component | Limit | Notes |
|-----------|-------|-------|
| Lambda Reserved Concurrency | 50 | Cost cap, prevents runaway spend |
| Lambda Provisioned Concurrency | 2 (optional) | Reduces cold starts |
| API Gateway Throttle | 10 req/s per key | Per-user limit |
| Bedrock On-Demand | No limit | Scales automatically |
| VPC Endpoints | Scales automatically | No configuration needed |

## Cost Optimization

### Estimated Monthly Costs (MVP)
| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 100 policies/day | ~$5-10 |
| Bedrock | 100 policies/day | ~$100-150 |
| API Gateway | 100 policies/day | ~$1-2 |
| CloudWatch | Logs + Metrics | ~$2-5 |
| VPC Endpoints | 5 endpoints | ~$25-30 |
| **Total** | | **~$135-200** |

### Cost Optimization Strategies
1. **CloudWatch Retention**: 7 days (vs. 30+)
2. **Lambda Reserved Concurrency**: Prevents over-provisioning
3. **Bedrock On-Demand**: No provisioned throughput costs
4. **VPC Endpoint Sharing**: Reuse endpoints across services

## Disaster Recovery

### Backup Strategy
1. **Frontend (S3)**: Versioning enabled
2. **Infrastructure Code**: Version controlled in Git
3. **Configuration**: Infrastructure as Code (no manual configs)

### Recovery Procedures
1. **Frontend Outage**:
   - Revert S3 version via CDK redeploy
   - RTO: 5-10 minutes

2. **Lambda Outage**:
   - Automatic fail-over (Lambda manages HA)
   - Multi-AZ deployment
   - RTO: 0-5 minutes

3. **Full Stack Recovery**:
   - Redeploy via CDK: `cdk deploy`
   - RTO: 10-15 minutes

## Future Enhancements

1. **Multi-Region Deployment**: Active-active replication
2. **Deny Policy Generation**: Extended policy types
3. **Policy Caching**: Store common policies
4. **Historical Audit**: Long-term policy storage
5. **Advanced Monitoring**: Custom dashboards and analytics
6. **Performance Optimization**: Lambda layer pre-warming
