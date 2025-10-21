# AWS Deployment Guide - IAM Policy Generator

## Architecture Overview

This application uses a **serverless architecture** with:
- **Frontend**: React + TypeScript + Vite (hosted on S3 + CloudFront)
- **Backend**: AWS Lambda + Bedrock (Claude 3 Sonnet) for AI-generated policies
- **Database**: DynamoDB for policy storage
- **API**: API Gateway for REST endpoints

**Estimated Monthly Cost**: $0.50 - $5 (pay-per-use serverless)

---

## Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured: `aws configure`
3. **Terraform** (v1.0+): [Install Terraform](https://www.terraform.io/downloads)
4. **Node.js** (v18+) and npm
5. **AWS Bedrock Access**: Request access to Claude 3 Sonnet model in your AWS account
   - Go to AWS Console → Bedrock → Model Access → Request Access for `anthropic.claude-3-sonnet-20240229-v1:0`
   - This is instant but may take a few minutes

---

## Deployment Steps

### Step 1: Build the Frontend

```bash
# Install dependencies
npm install

# Build the production bundle
npm run build

# Output: dist/ directory with optimized static files
```

### Step 2: Install Terraform Dependencies

```bash
cd terraform
terraform init

# You should see: "Terraform has been successfully initialized!"
```

### Step 3: Review Deployment Plan

```bash
# Review what will be created
terraform plan

# Output shows all AWS resources to be provisioned
```

### Step 4: Deploy Infrastructure

```bash
# Deploy everything (S3, CloudFront, Lambda, DynamoDB, API Gateway)
terraform apply

# When prompted, type: yes
```

This will create:
- ✅ S3 bucket for frontend hosting
- ✅ CloudFront distribution for global CDN
- ✅ Lambda function for policy generation
- ✅ DynamoDB table for policy storage
- ✅ API Gateway REST API
- ✅ All required IAM roles and permissions

**Deployment time**: ~5-10 minutes

### Step 5: Get Your URLs

After deployment completes, Terraform will output:

```
Outputs:

api_gateway_endpoint = "https://xxx.execute-api.us-east-1.amazonaws.com/prod"
bedrock_model_info = {
  "model_id" = "anthropic.claude-3-sonnet-20240229-v1:0"
  "model_name" = "Claude 3 Sonnet"
}
cloudfront_url = "https://abc123.cloudfront.net"
cloudfront_distribution_domain_name = "abc123.cloudfront.net"
deployment_info = {
  "api_endpoint" = "https://xxx.execute-api.us-east-1.amazonaws.com/prod"
  "bedrock_model" = "anthropic.claude-3-sonnet-20240229-v1:0"
  "environment" = "prod"
  "frontend_url" = "https://abc123.cloudfront.net"
  "region" = "us-east-1"
}
dynamodb_table_name = "iam-policies-prod"
lambda_function_name = "iam-policy-generator-prod"
s3_bucket_name = "iam-policy-gen-123456789-prod"
```

Copy the `cloudfront_url` - this is your application!

### Step 6: Upload Frontend to S3

```bash
# Build frontend if not done already
npm run build

# Sync dist files to S3
aws s3 sync dist/ s3://$(terraform output -raw s3_bucket_name) --delete

# ✅ Frontend is now live!
```

### Step 7: Test the Application

Open your CloudFront URL in a browser and:

1. Enter a policy description (e.g., "Grant S3 read access")
2. Click "Generate Policy"
3. Watch as Claude generates a real IAM policy
4. View policies in the history section above the footer

---

## Environment Configuration

Customize deployment by editing `terraform/terraform.tfvars`:

```hcl
aws_region           = "us-east-1"          # AWS region
environment          = "prod"               # Environment name
bedrock_model_id     = "anthropic.claude-3-sonnet-20240229-v1:0"  # Model
lambda_timeout       = 60                   # Timeout in seconds
lambda_memory        = 512                  # Memory in MB
```

---

## Troubleshooting

### Error: "Bedrock model access denied"
- Go to AWS Console → Bedrock → Model Access
- Ensure Claude 3 Sonnet is enabled for your account
- May take 5-10 minutes after enabling

### Error: "S3 bucket already exists"
- S3 bucket names are globally unique
- Terraform auto-generates: `iam-policy-gen-{account-id}-{environment}`
- Already exists if you deployed before

### CloudFront Not Showing Latest Version
- CloudFront caches files for 1 hour
- Either:
  - Wait 1 hour for cache to expire
  - Invalidate cache: `aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"`
  - Use deployment script below

### Lambda Timeout / Policy Generation Fails
- Increase `lambda_timeout` in variables (default: 60s)
- Run `terraform apply` to redeploy

---

## Useful Commands

### View Deployment Info
```bash
cd terraform
terraform output
```

### Destroy Everything (Be Careful!)
```bash
cd terraform
terraform destroy
# ⚠️ This deletes all AWS resources!
```

### View Lambda Logs
```bash
aws logs tail /aws/lambda/iam-policy-generator-prod --follow
```

### Manual S3 Upload Script
```bash
#!/bin/bash
# save as: deploy.sh

BUCKET=$(cd terraform && terraform output -raw s3_bucket_name)
DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

npm run build
aws s3 sync dist/ s3://$BUCKET --delete
[ -n "$DIST_ID" ] && aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
echo "✅ Deployment complete!"
```

---

## API Endpoints

All requests go through CloudFront → API Gateway → Lambda.

### Generate Policy
```bash
curl -X POST https://<api-endpoint>/policies \
  -H "Content-Type: application/json" \
  -d '{"description": "Grant S3 read access"}'
```

### Get All Policies
```bash
curl https://<api-endpoint>/policies
```

### Delete Policy
```bash
curl -X DELETE https://<api-endpoint>/policies/{policy_id}
```

---

## Cost Optimization Tips

1. **Use S3 Lifecycle Policies** - Delete old build artifacts
2. **Monitor Lambda Execution** - View CloudWatch metrics
3. **DynamoDB TTL** - Policies auto-delete after 90 days
4. **CloudFront Compression** - Already enabled

### Estimated Pricing Breakdown
| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 100 invocations/month | $0.20 |
| Bedrock | 100 requests/month (avg 500 tokens) | $0.50 |
| DynamoDB | 100 items stored | $0.10 |
| CloudFront | 10GB data transfer | $0.85 |
| S3 | <1GB storage | $0.02 |
| **Total** | **Estimated** | **~$1.67/month** |

---

## Support & Monitoring

### CloudWatch Dashboard
```bash
# View Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=iam-policy-generator-prod \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

### DynamoDB Monitoring
- AWS Console → DynamoDB → iam-policies-prod → Monitor
- View read/write capacity and item count

---

## Next Steps

1. ✅ Customize the policy generation in `lambda/index.js`
2. ✅ Add custom domain via Route 53
3. ✅ Enable WAF on CloudFront
4. ✅ Set up CI/CD pipeline with GitHub Actions
5. ✅ Add authentication with AWS Cognito

---

## File Structure

```
.
├── src/                          # React frontend
│   ├── App.tsx
│   ├── components/
│   └── services/apiClient.ts    # API communication
├── lambda/
│   └── index.js                 # Lambda handler + Bedrock integration
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                  # S3, CloudFront, API Gateway
│   ├── lambda.tf                # Lambda, IAM roles
│   ├── dynamodb.tf              # DynamoDB table
│   ├── bedrock.tf               # Bedrock model reference
│   ├── outputs.tf               # Deployment outputs
│   └── variables.tf             # Configuration variables
├── dist/                        # Build output (run: npm run build)
└── deployment.md               # This file
```

---

## Questions or Issues?

- Check AWS CloudWatch Logs: `/aws/lambda/iam-policy-generator-prod`
- Review Terraform plan: `terraform plan`
- Test Lambda locally: Use AWS SAM or AWS CLI

🚀 **Happy Deploying!**
