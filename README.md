# AI-Powered IAM Policy Generator

## Project Overview

Reduce IAM over-provisioning risk by 90% by enabling Cloud Engineers and DevOps teams to generate secure, least-privilege IAM policies in under 3 seconds using natural language input.

### Problem Statement

Current IAM policy creation workflows force engineers to choose between speed and security:
- **Manual policy authoring** requires extensive AWS documentation research (20-45 minutes per policy)
- **Copy-pasting examples** leads to over-permissioned access (using wildcard `*` actions)
- **Testing and iterating** on policies is slow and error-prone

### Solution

Generate production-ready IAM policies instantly using AI, eliminating the speed vs. security trade-off.

## Key Features

- **Natural Language Input**: Describe access requirements in plain English
- **Least-Privilege Policies**: Generated policies use specific actions and resource ARNs (no wildcards)
- **Condition Key Enforcement**: Includes VPC endpoints, tags, and encryption requirements
- **Instant Generation**: Policy generation completes in under 3 seconds
- **Valid JSON Output**: Policies can be copied directly into AWS Console, Terraform, or CDK

## Target Users

- **Cloud Engineers**: AWS practitioners responsible for infrastructure and security
- **DevOps Engineers**: Teams deploying applications and managing CI/CD pipelines

## Technology Stack

### Frontend
- React 18+ (TypeScript)
- AWS Amplify or S3 + CloudFront hosting

### Backend
- Python 3.12 Lambda functions
- AWS API Gateway (REST API)
- Amazon Bedrock (Claude 3.5 Sonnet)

### Infrastructure
- AWS CDK (TypeScript) or Terraform
- VPC with private subnets and VPC endpoints
- CloudWatch Logs and Metrics

### AWS Services
- Lambda (policy generation logic)
- API Gateway (REST API endpoint)
- Bedrock (AI model inference)
- VPC Endpoints (PrivateLink)
- CloudWatch (logging and monitoring)
- IAM (access control)

## Architecture Overview

```
┌─────────────────┐
│   CloudFront    │ (CDN for static assets)
└────────┬────────┘
         │
┌────────▼────────┐
│  S3 + Amplify   │ (Frontend)
└────────┬────────┘
         │
┌────────▼────────┐
│  API Gateway    │ (REST API with WAF)
└────────┬────────┘
         │
┌────────▼────────┐
│  Lambda Func    │ (Policy Generator)
│  (Private VPC)  │
└────┬────────┬───┘
     │        │
     │        └──────────────┐
     │                       │
┌────▼──────────┐   ┌────────▼──────────┐
│    Bedrock    │   │  CloudWatch Logs  │
│ (via VPC EP)  │   │   (via VPC EP)    │
└───────────────┘   └───────────────────┘
```

For detailed architecture information, see [infrastructure.md](infrastructure.md).

## Getting Started

### Prerequisites
- AWS Account with appropriate permissions
- Node.js 18+ (for CDK deployment)
- Python 3.12 (for Lambda development)
- AWS CLI configured

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure AWS credentials
4. See [deployment.md](deployment.md) for deployment instructions

## Usage

### Example 1: S3 Read-Only Access
**Input**: "Lambda function needs read-only access to S3 bucket 'data-lake'"

**Generated Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadDataLakeBucket",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::data-lake",
        "arn:aws:s3:::data-lake/*"
      ]
    }
  ]
}
```

### Example 2: EC2 with Tag-Based Conditions
**Input**: "Developer needs to start and stop EC2 instances tagged 'environment=testing'"

**Generated Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ManageTestingEC2Instances",
      "Effect": "Allow",
      "Action": ["ec2:StartInstances", "ec2:StopInstances"],
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/environment": "testing"
        }
      }
    }
  ]
}
```

## API Documentation

### Endpoint
- **POST** `/generate-policy`

### Request
```json
{
  "description": "User's natural language input",
  "options": {
    "includeConditions": true,
    "strictMode": true
  }
}
```

### Response
```json
{
  "policy": { /* IAM Policy JSON */ },
  "explanation": "Human-readable summary",
  "warnings": ["Optional warnings about generated policy"]
}
```

## Deployment

See [deployment.md](deployment.md) for:
- Prerequisites and environment setup
- Configuration steps
- Build and deployment commands
- Verification steps
- Troubleshooting

## Infrastructure

See [infrastructure.md](infrastructure.md) for:
- Detailed AWS service architecture
- Network topology
- Security controls
- Scalability considerations

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create tests for new features (TDD approach)
2. Ensure all tests pass before submitting
3. Keep commits focused and descriptive
4. Update documentation as needed

## Security & Compliance

- All communication uses HTTPS/TLS
- Lambda runs in private VPC subnets (no internet access)
- VPC Endpoints used for AWS service communication
- Least-privilege IAM roles enforced
- CloudWatch Logs encrypted and retained for 7 days
- No sensitive data stored beyond logs

## Success Metrics

| Metric | Target |
|--------|--------|
| Policy Generation Time | < 3 seconds (p95) |
| Policies Requiring Zero Manual Edits | ≥ 85% |
| Error Rate | < 2% |
| System Uptime | 99.9% |

## Support

For issues or questions:
1. Check [deployment.md](deployment.md) and [infrastructure.md](infrastructure.md)
2. Review CloudWatch Logs for error details
3. Create an issue on the repository

## License

[Add license information here]

## Roadmap

See [roadmap.md](roadmap.md) for planned features and project evolution.
