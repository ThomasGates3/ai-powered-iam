aws_region  = "us-east-1"
project_name = "iam-policy-generator"
environment = "dev"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# Lambda Configuration
lambda_runtime               = "python3.12"
lambda_memory                = 1024
lambda_timeout               = 10
lambda_reserved_concurrency  = 50

# Bedrock
bedrock_model_id = "anthropic.claude-3-5-sonnet-20241022-v2:0"

# API Configuration
api_rate_limit = 10
cors_origins   = ["*"]

# Monitoring
cloudwatch_log_retention_days = 7
log_level                      = "INFO"

# Tags
common_tags = {
  ManagedBy   = "Terraform"
  Project     = "IAMPolicyGenerator"
  Environment = "dev"
  Owner       = "Engineering"
}
