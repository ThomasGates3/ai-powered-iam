terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "iam-policy-generator-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      Terraform   = "true"
      CreatedAt   = timestamp()
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr

  tags = var.common_tags
}

# Security (IAM, Security Groups)
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id

  bedrock_model_id = var.bedrock_model_id
  region          = var.aws_region

  tags = var.common_tags
}

# Lambda Function
module "lambda" {
  source = "./modules/lambda"

  project_name = var.project_name
  environment  = var.environment

  function_name        = "${var.project_name}-policy-generator"
  runtime              = var.lambda_runtime
  memory_size          = var.lambda_memory
  timeout              = var.lambda_timeout
  reserved_concurrency = var.lambda_reserved_concurrency

  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  vpc_security_group  = module.security.lambda_security_group

  execution_role_arn = module.security.lambda_execution_role_arn

  environment_variables = {
    BEDROCK_MODEL_ID = var.bedrock_model_id
    BEDROCK_REGION   = var.aws_region
    LOG_LEVEL        = var.log_level
  }

  tags = var.common_tags

  depends_on = [module.vpc, module.security]
}

# API Gateway
module "api_gateway" {
  source = "./modules/api_gateway"

  project_name = var.project_name
  environment  = var.environment

  lambda_function_arn       = module.lambda.function_arn
  lambda_function_name      = module.lambda.function_name
  lambda_invoke_arn         = module.lambda.invoke_arn

  api_rate_limit = var.api_rate_limit
  cors_origins   = var.cors_origins

  tags = var.common_tags

  depends_on = [module.lambda]
}

# CloudWatch Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  project_name = var.project_name
  environment  = var.environment

  lambda_function_name = module.lambda.function_name
  log_retention_days   = var.cloudwatch_log_retention_days

  tags = var.common_tags

  depends_on = [module.lambda]
}
