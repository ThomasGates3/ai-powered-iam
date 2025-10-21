# Terraform Infrastructure - IAM Policy Generator

## Overview

Production-ready AWS infrastructure as code using Terraform with modules for VPC, Lambda, API Gateway, security, and monitoring.

## Prerequisites

### AWS Account
- AWS Account with appropriate permissions
- AWS CLI v2 configured with credentials
- Region: `us-east-1` (configurable)

### Local Machine
- Terraform 1.0+
- AWS CLI v2
- Git (for state management)

### AWS Service Requirements
- Bedrock enabled in your region
- Bedrock Claude 3.5 Sonnet model access

Enable Bedrock:
```bash
aws bedrock describe-foundation-models --region us-east-1
# If error, enable via AWS Console: Bedrock > Model Access > Request Access
```

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

This will:
- Download providers (AWS)
- Set up the backend (local for now)
- Create `.terraform/` directory

### 2. Plan Deployment

```bash
terraform plan -var-file=terraform.tfvars
```

Review the changes that will be created.

### 3. Apply Configuration

```bash
terraform apply -var-file=terraform.tfvars
```

Confirm with `yes` when prompted.

Expected output:
```
1. Creating VPC...
✓ VPC created: vpc-abc123def456

2. Creating private subnets...
✓ Private Subnet 1: subnet-abc123 (10.0.1.0/24)
✓ Private Subnet 2: subnet-def456 (10.0.2.0/24)

3. Creating VPC Endpoints...
✓ Bedrock VPC Endpoint: vpce-abc123
✓ CloudWatch Logs VPC Endpoint: vpce-def456
✓ Secrets Manager VPC Endpoint: vpce-ghi789

4. Creating IAM Roles...
✓ Lambda execution role created
✓ API Gateway role created

5. Creating Lambda function...
✓ Lambda function created: iam-policy-generator

6. Creating API Gateway...
✓ API Gateway created: https://abc123def456.execute-api.us-east-1.amazonaws.com/iam-policy-generator

7. Creating CloudWatch resources...
✓ Log group created: /aws/lambda/iam-policy-generator
✓ Alarms configured

✓ Infrastructure deployment complete
```

### 4. Retrieve Outputs

```bash
terraform output
```

Key outputs:
- `api_gateway_endpoint`: Your API endpoint URL
- `lambda_function_name`: Lambda function name
- `vpc_id`: VPC ID
- `cloudwatch_log_group`: CloudWatch log group

## Configuration

### terraform.tfvars

Main configuration file with sensible defaults:

```hcl
aws_region              = "us-east-1"
project_name            = "iam-policy-generator"
environment             = "dev"
vpc_cidr                = "10.0.0.0/16"
lambda_memory           = 1024
lambda_timeout          = 10
lambda_reserved_concurrency = 50
api_rate_limit          = 10
cloudwatch_log_retention_days = 7
log_level               = "INFO"
```

### Customization

Edit `terraform.tfvars` before deployment:

```hcl
# Change environment
environment = "prod"

# Increase Lambda memory for faster inference
lambda_memory = 2048

# Restrict CORS to specific domain
cors_origins = ["https://yourdomain.com"]

# Longer log retention for production
cloudwatch_log_retention_days = 30
```

## Architecture

### VPC Module (`modules/vpc/`)

**Resources:**
- VPC (10.0.0.0/16)
- 2 private subnets (10.0.1.0/24, 10.0.2.0/24) across 2 AZs
- VPC Endpoints:
  - Bedrock Runtime (com.amazonaws.us-east-1.bedrock-runtime)
  - CloudWatch Logs (com.amazonaws.us-east-1.logs)
  - Secrets Manager (com.amazonaws.us-east-1.secretsmanager)
- Security groups

**No internet access**: Lambda has no direct internet, only VPC endpoint access.

### Security Module (`modules/security/`)

**Resources:**
- Lambda execution role with least-privilege policies
- API Gateway role
- Security groups for Lambda and VPC endpoints

**IAM Policies:**
- Lambda: Bedrock invoke, CloudWatch logs, VPC network interfaces
- API Gateway: CloudWatch logs delivery

### Lambda Module (`modules/lambda/`)

**Resources:**
- Lambda function (Python 3.12)
- Function execution configuration (1024 MB, 10s timeout)
- VPC attachment with private subnets
- CloudWatch log group

**Code:** `src/lambda_function.py`

### API Gateway Module (`modules/api_gateway/`)

**Resources:**
- REST API
- POST /generate-policy resource
- Lambda integration
- API deployment and stage
- API key

**Endpoint:** `{api-id}.execute-api.us-east-1.amazonaws.com/iam-policy-generator/generate-policy`

### Monitoring Module (`modules/monitoring/`)

**Resources:**
- CloudWatch alarms:
  - Lambda error rate > 5%
  - Lambda duration > 5 seconds
  - Lambda throttles detected

## Deployment Workflow

### Development

```bash
# Plan changes
terraform plan -var-file=terraform.tfvars

# Apply changes
terraform apply -var-file=terraform.tfvars

# View outputs
terraform output
```

### Staging/Production

Create environment-specific files:

```bash
# Create staging config
cp terraform.tfvars terraform-staging.tfvars
# Edit: environment = "staging", lambda_memory = 1024

# Deploy
terraform apply -var-file=terraform-staging.tfvars
```

## State Management

### Local State (Current)

State stored in `terraform.tfstate` (git-ignored).

For production, migrate to S3 backend:

```hcl
# terraform/main.tf
backend "s3" {
  bucket         = "iam-policy-generator-terraform-state"
  key            = "prod/terraform.tfstate"
  region         = "us-east-1"
  encrypt        = true
  dynamodb_table = "terraform-locks"
}
```

## Testing

### Validate Syntax

```bash
terraform validate
```

### Format Check

```bash
terraform fmt -check -recursive .
```

### Plan Review

```bash
terraform plan -out=tfplan
terraform show tfplan
```

## Troubleshooting

### Error: "Failed to assume role"

**Cause**: AWS credentials not configured or insufficient permissions

**Solution:**
```bash
aws sts get-caller-identity  # Verify credentials
aws configure                 # Reconfigure if needed
```

### Error: "Bedrock model not found"

**Cause**: Bedrock not enabled in region or model access not granted

**Solution:**
1. Go to AWS Console > Bedrock > Model Access
2. Click "Request Access" for Claude 3.5 Sonnet
3. Wait for approval (usually instant)

### Error: "VPC Endpoint creation failed"

**Cause**: Region doesn't support VPC endpoints for the service

**Solution**: Use `terraform destroy` and try a different region:
```bash
terraform apply -var-file=terraform.tfvars -var aws_region=us-west-2
```

### Lambda Timeout (> 10 seconds)

**Cause**: Cold start or slow Bedrock inference

**Solution**: Increase Lambda memory (scales CPU):
```bash
terraform apply -var-file=terraform.tfvars -var lambda_memory=2048
```

## Monitoring

### View Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/iam-policy-generator --follow

# With grep filter
aws logs tail /aws/lambda/iam-policy-generator --follow --grep "ERROR"
```

### CloudWatch Metrics

```bash
# Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=iam-policy-generator \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## Cleanup

### Destroy All Resources

```bash
terraform destroy -var-file=terraform.tfvars
```

**Warning**: This will delete:
- VPC and subnets
- Lambda function
- API Gateway
- IAM roles
- CloudWatch log groups

Type `yes` to confirm.

## File Structure

```
terraform/
├── main.tf                  # Main stack definition
├── variables.tf             # Input variables
├── outputs.tf               # Output values
├── terraform.tfvars         # Default values
│
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── security/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── lambda/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── src/
│   │       └── lambda_function.py
│   │
│   ├── api_gateway/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── monitoring/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── terraform.tfstate        # State file (git-ignored)
```

## Best Practices

### Before Deployment
- [ ] Review terraform.tfvars for your environment
- [ ] Run `terraform plan` and review all resources
- [ ] Verify AWS credentials and permissions
- [ ] Ensure Bedrock access is enabled

### After Deployment
- [ ] Test API endpoint: `curl -X POST {api-endpoint} -d '{"description":"..."}'`
- [ ] Check CloudWatch logs for Lambda execution
- [ ] Verify security groups and VPC setup
- [ ] Set up CloudWatch alarms notifications

### Ongoing
- [ ] Monitor CloudWatch logs and metrics
- [ ] Review and rotate API keys regularly
- [ ] Keep Terraform and AWS CLI updated
- [ ] Document any manual changes in git

## Support

For issues:
1. Check Troubleshooting section
2. Review CloudWatch logs: `aws logs tail /aws/lambda/iam-policy-generator`
3. Run `terraform validate` and `terraform plan`
4. Check AWS Console for resource details
