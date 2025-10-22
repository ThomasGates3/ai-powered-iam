# Deployment Troubleshooting Guide

## DNS Lookup Error During Terraform Apply

If you encounter errors like:
```
Error: listing tags for DynamoDB Table - dial tcp: lookup 049475639513.ddb.us-east-1.amazonaws.com: no such host
Error: waiting for CloudFront Distribution - dial tcp: lookup cloudfront.amazonaws.com: no such host
```

### Root Cause
This indicates your environment has network restrictions that prevent direct AWS API calls from your machine. This is common in:
- Corporate networks with proxies
- Restricted VPCs or networks
- Environment-specific DNS resolution issues

### Solution 1: Deploy from AWS CloudShell (Recommended)

AWS CloudShell runs in AWS and has full network access:

1. **Go to AWS Console**
   - Log in to https://console.aws.amazon.com
   - Click the CloudShell icon (>_) in the top toolbar

2. **Clone the repository**
   ```bash
   git clone https://github.com/ThomasGates3/ai-powered-iam.git
   cd ai-powered-iam
   ```

3. **Build frontend**
   ```bash
   npm install
   npm run build
   ```

4. **Deploy Terraform**
   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

5. **Upload frontend**
   ```bash
   aws s3 sync ../dist s3://$(terraform output -raw s3_bucket_name)
   ```

6. **Get your URL**
   ```bash
   terraform output cloudfront_url
   ```

**Why this works**: CloudShell runs inside AWS with full network access to all AWS APIs.

---

### Solution 2: Check Network Connectivity

If you prefer to deploy locally:

1. **Test AWS API connectivity**
   ```bash
   # This should work
   aws sts get-caller-identity

   # If this fails, there's a network issue
   curl -I https://dynamodb.us-east-1.amazonaws.com
   ```

2. **Check DNS resolution**
   ```bash
   nslookup dynamodb.us-east-1.amazonaws.com
   nslookup cloudfront.amazonaws.com
   ```

3. **If DNS fails**, check:
   - Corporate proxy settings
   - VPN connectivity
   - Network firewall rules
   - DNS configuration

4. **Workaround for corporate networks**
   ```bash
   # Set AWS endpoints explicitly
   export AWS_ENDPOINT_URL_DYNAMODB=https://dynamodb.us-east-1.amazonaws.com
   export AWS_ENDPOINT_URL_CLOUDFRONT=https://cloudfront.amazonaws.com

   # Then try terraform apply again
   terraform apply
   ```

---

### Solution 3: Manual AWS Console Deployment

If CLI-based deployment isn't working, deploy components manually:

1. **S3 Bucket**
   - Go to S3 → Create bucket → `iam-policy-gen-{account-id}-prod`
   - Enable versioning
   - Block public access
   - Upload frontend: `dist/` folder

2. **CloudFront**
   - Create distribution
   - Origin: S3 bucket
   - Default cache behavior: 3600 seconds
   - Custom error response: 404 → index.html (200)
   - Deploy

3. **Lambda Function**
   - Create function: Node.js 18.x
   - Paste code from `lambda/index.js`
   - Set environment variables:
     - `AWS_REGION=us-east-1`
     - `BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0`
     - `DYNAMODB_TABLE=iam-policies-prod`
   - Attach execution role with Bedrock + DynamoDB permissions

4. **DynamoDB Table**
   - Create table: `iam-policies-prod`
   - Partition key: `policy_id` (String)
   - Billing: On-demand
   - Enable TTL on `ttl` attribute

5. **API Gateway**
   - Create REST API
   - Create resource: `/policies`
   - Create methods: GET, POST, DELETE, OPTIONS
   - Integration: Lambda proxy integration
   - Deploy to `prod` stage

6. **Update Frontend**
   - Edit `src/services/apiClient.ts`
   - Set `VITE_API_ENDPOINT` to API Gateway URL
   - Rebuild: `npm run build`
   - Redeploy to S3

---

## Terraform State Issues

If Terraform gets stuck:

```bash
# View current state
terraform state list

# If partially created resources are stuck, refresh:
terraform state rm aws_dynamodb_table.policies
terraform state rm aws_cloudfront_distribution.frontend

# Then retry apply
terraform apply
```

---

## Testing Without Full Deployment

To test the Lambda function locally:

```bash
# Install dependencies
cd lambda
npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-dynamodb uuid

# Test with AWS SAM (optional)
npm install -g aws-sam-cli
sam build
sam local start-api

# Or test via deployed API Gateway once it exists
curl -X POST https://your-api-gateway-url/policies \
  -H "Content-Type: application/json" \
  -d '{"description": "Grant S3 read access"}'
```

---

## Next Steps After Successful Deployment

Once deployed:

1. **Verify infrastructure**
   ```bash
   # Check Lambda
   aws lambda get-function --function-name iam-policy-generator-prod

   # Check DynamoDB
   aws dynamodb describe-table --table-name iam-policies-prod

   # Check API Gateway
   aws apigateway get-rest-apis
   ```

2. **Test the application**
   - Open CloudFront URL
   - Enter: "Grant S3 read access"
   - Click "Generate Policy"
   - Wait for response (~2 seconds)

3. **Monitor CloudWatch**
   ```bash
   aws logs tail /aws/lambda/iam-policy-generator-prod --follow
   ```

---

## Common Issues Reference

| Error | Cause | Solution |
|-------|-------|----------|
| DNS lookup failed | Network blocked | Use CloudShell or fix network/DNS |
| Bedrock access denied | Model not enabled | Enable in Bedrock console |
| Lambda timeout | Generation too slow | Increase timeout in variables.tf |
| CloudFront caching | Old version showing | Invalidate cache or wait 1 hour |
| DynamoDB errors | Table doesn't exist | Check terraform apply completed |

---

**Recommendation**: Use **CloudShell** for the smoothest deployment experience (Solution 1).
