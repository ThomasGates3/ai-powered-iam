# AI-Powered IAM Policy Generator

Generate least-privilege AWS IAM policies using Claude 3 Sonnet AI, with policy history and persistent storage.

## Overview

A modern, serverless web application that uses AWS Bedrock (Claude 3 Sonnet) to generate production-ready IAM policies from natural language descriptions. Features real-time policy generation, complete policy history, and an elegant dual-theme UI.

### ✨ Key Features

- **AI-Powered Policy Generation** - Claude 3 Sonnet generates secure, least-privilege IAM policies
- **Policy History** - View, copy, and delete all previously generated policies
- **Dual Theme** - Beautiful light cyan and dark purple themes with smooth transitions
- **Serverless Architecture** - Fully managed AWS services, pay-per-use pricing
- **Real-time Storage** - DynamoDB persistence with 90-day TTL auto-cleanup
- **Global CDN** - CloudFront distribution for fast worldwide access
- **Responsive Design** - Mobile-first design works seamlessly on all devices

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Vite** - Lightning-fast build tool
- **Axios** - HTTP client

### Backend
- **AWS Lambda** - Serverless compute
- **AWS Bedrock** - Claude 3 Sonnet AI model
- **AWS DynamoDB** - NoSQL database
- **AWS API Gateway** - REST API endpoint
- **AWS S3** - Frontend hosting
- **AWS CloudFront** - Content delivery network
- **Terraform** - Infrastructure as Code

## Quick Start

### Prerequisites
- Node.js 18+
- AWS Account with Bedrock access
- AWS CLI configured
- Terraform v1.0+

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Deploy to AWS

```bash
# Build frontend
npm run build

# Initialize Terraform
cd terraform
terraform init

# Deploy infrastructure (5-10 minutes)
terraform apply

# Upload frontend
aws s3 sync ../dist s3://$(terraform output -raw s3_bucket_name)

# Get your URL
terraform output cloudfront_url
```

**Full deployment guide**: See [deployment.md](./deployment.md)

## Architecture

```
┌─────────────────────────────────────────────────┐
│ User Browser                                    │
│ (React App - Dual Theme)                        │
└────────────┬────────────────────────────────────┘
             │
             ↓ HTTPS
┌─────────────────────────────────────────────────┐
│ CloudFront (Global CDN)                         │
│ - Caches static assets                          │
│ - SSL/TLS termination                           │
└────────────┬────────────────────────────────────┘
             │
             ├──→ S3 Bucket (Static Files)
             │
             └──→ API Gateway
                 ↓
            Lambda Function
            ↓
    ┌───────────────────┐
    │  Bedrock Claude   │ (Policy Generation)
    │  3 Sonnet         │
    └───────────────────┘
            ↓
    DynamoDB Table
    (Policy Storage)
```

**Data Flow:**
1. User enters policy description → React frontend
2. Frontend calls API Gateway → Lambda
3. Lambda invokes Bedrock Claude model
4. Claude returns generated policy JSON
5. Lambda stores in DynamoDB with TTL
6. Policy displayed & added to history
7. User can copy, download, or delete

## Usage

### Generate a Policy

1. Enter a description in natural language
   ```
   Example: "Grant EC2 instance read-only access to S3 bucket 'my-data'"
   ```

2. Click "Generate Policy"

3. Wait for Claude to generate the policy (~2 seconds)

4. View the generated IAM policy in JSON format

5. Copy or download the policy

### Manage Policy History

- **View History** - All policies displayed in scrollable list above footer
- **Copy Policy** - Click copy icon to copy JSON to clipboard
- **Delete Policy** - Click trash icon to remove from history
- **Auto-cleanup** - Policies automatically deleted after 90 days

### Toggle Theme

- Click the sun/moon icon in top-right header
- Choose between light cyan or dark purple theme
- Theme preference saved to browser localStorage

## API Endpoints

All requests are automatically proxied through CloudFront.

### Generate Policy
```bash
POST /policies
Content-Type: application/json

{
  "description": "Grant S3 read access and DynamoDB write access"
}

Response:
{
  "policy_id": "uuid",
  "timestamp": "2024-01-20T10:30:00Z",
  "description": "...",
  "policy_json": "{...}"
}
```

### Get All Policies
```bash
GET /policies

Response:
{
  "policies": [
    { "policy_id": "...", "timestamp": "...", ... },
    ...
  ]
}
```

### Delete Policy
```bash
DELETE /policies/{policy_id}

Response:
{
  "message": "Policy deleted"
}
```

## Configuration

Edit `terraform/variables.tf` to customize:

```hcl
variable "aws_region" {
  default = "us-east-1"        # AWS region
}

variable "bedrock_model_id" {
  default = "anthropic.claude-3-sonnet-20240229-v1:0"  # AI model
}

variable "lambda_timeout" {
  default = 60                 # Timeout in seconds
}

variable "lambda_memory" {
  default = 512                # Memory in MB
}
```

## Pricing

**Estimated Monthly Cost** (100 policy generations/month):

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | ~100 invocations | $0.20 |
| Bedrock | ~100 requests (avg 500 tokens) | $0.50 |
| DynamoDB | ~100 items | $0.10 |
| CloudFront | ~10GB transfer | $0.85 |
| S3 | <1GB storage | $0.02 |
| **Total** | | **~$1.67/month** |

Zero-cost scaling - costs remain proportional to usage.

## Project Structure

```
.
├── src/
│   ├── App.tsx                   # Main app with theme & history
│   ├── components/
│   │   ├── InputPanel.tsx        # Policy input form
│   │   ├── CodeEditor.tsx        # JSON policy viewer
│   │   ├── ActionButtons.tsx     # Copy/Download buttons
│   │   ├── FeatureGrid.tsx       # Feature showcase cards
│   │   ├── PoliciesHistory.tsx   # Policy history list
│   │   ├── ThemeToggle.tsx       # Sun/moon theme switch
│   │   ├── LoadingAnimation.tsx  # Loading spinner
│   │   └── NotificationToast.tsx # Notification messages
│   ├── services/
│   │   └── apiClient.ts          # API communication
│   ├── utils/
│   │   └── policyGenerator.ts    # (Legacy client-side fallback)
│   └── index.css                 # Theme variables
├── lambda/
│   └── index.js                  # Lambda handler + Bedrock integration
├── terraform/
│   ├── main.tf                   # S3, CloudFront, API Gateway
│   ├── lambda.tf                 # Lambda function & IAM roles
│   ├── dynamodb.tf               # DynamoDB table
│   ├── bedrock.tf                # Bedrock model reference
│   ├── outputs.tf                # Deployment outputs
│   └── variables.tf              # Configuration
├── dist/                         # Build output
├── deployment.md                 # Deployment guide
└── README.md                     # This file
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start dev server on http://localhost:5173
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Testing the Lambda Function Locally

```bash
# Install dependencies in lambda/
cd lambda
npm init -y
npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-dynamodb uuid

# Use AWS SAM or invoke via API Gateway
cd ..
```

## Troubleshooting

### "Bedrock model access denied"
- Request access to Claude 3 Sonnet in AWS Bedrock console
- Takes ~5 minutes after enabling

### CloudFront showing old content
- CloudFront caches for 1 hour by default
- Invalidate: `aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"`

### Lambda timeout
- Increase `lambda_timeout` in Terraform variables
- Default is 60 seconds (usually sufficient)

### API requests failing
- Check Lambda logs: `aws logs tail /aws/lambda/iam-policy-generator-prod --follow`
- Verify DynamoDB table exists: `aws dynamodb describe-table --table-name iam-policies-prod`

## Security Considerations

- ✅ IAM policies use least-privilege model
- ✅ Lambda has minimal required permissions (Bedrock + DynamoDB only)
- ✅ DynamoDB point-in-time recovery enabled
- ✅ S3 public access blocked
- ✅ CloudFront HTTPS/TLS enforced
- ✅ No API authentication required (open for demo - add OAuth/API keys for production)

## Performance

- **Frontend Load Time** - <1 second (CloudFront CDN)
- **Policy Generation** - ~2 seconds (Bedrock latency)
- **API Response** - <200ms (Lambda + DynamoDB)
- **Global Availability** - CloudFront edge locations worldwide

## Future Enhancements

- [ ] User authentication with AWS Cognito
- [ ] Policy validation against AWS best practices
- [ ] Role-based access control (RBAC)
- [ ] Export policies to terraform/CloudFormation
- [ ] Batch policy generation
- [ ] Custom policy templates
- [ ] Policy versioning and comparison

## License

MIT - Use freely for personal and commercial projects

## Support

For issues or questions:
1. Check [deployment.md](./deployment.md) for deployment troubleshooting
2. Review Lambda logs in CloudWatch
3. Verify AWS Bedrock access is enabled
4. Open a GitHub issue with logs and configuration

---

**Built with React, TypeScript, AWS Lambda, Bedrock, and Terraform**

© 2025 Thomas Gates III
