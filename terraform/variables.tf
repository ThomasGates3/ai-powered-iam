variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "prod"
}

variable "bedrock_model_id" {
  description = "Bedrock model ID for policy generation"
  default     = "anthropic.claude-3-sonnet-20240229-v1:0"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  default     = 60
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  default     = 512
}
