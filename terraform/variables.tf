variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "prod"
}

variable "openrouter_api_key" {
  description = "OpenRouter API key for Claude model access"
  sensitive   = true
  default     = ""
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  default     = 60
}

variable "lambda_memory" {
  description = "Lambda function memory in MB"
  default     = 512
}
