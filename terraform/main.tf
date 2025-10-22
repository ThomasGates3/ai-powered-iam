terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# S3 bucket for static website hosting
resource "aws_s3_bucket" "website" {
  bucket = "iam-policy-gen-website-${data.aws_caller_identity.current.account_id}-${var.environment}"

  tags = {
    Environment = var.environment
    Application = "iam-policy-generator"
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy to allow public read access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PublicReadGetObject"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# Enable static website hosting
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "api" {
  name        = "iam-policy-generator-api-${var.environment}"
  description = "API for IAM Policy Generator"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Environment = var.environment
    Application = "iam-policy-generator"
  }
}

# API Gateway resource
resource "aws_api_gateway_resource" "policies" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "policies"
}

# API Gateway proxy resource
resource "aws_api_gateway_resource" "policies_proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.policies.id
  path_part   = "{proxy+}"
}

# API Gateway methods (POST, GET, DELETE, OPTIONS)
resource "aws_api_gateway_method" "any_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.policies.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "proxy_any_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.policies_proxy.id
  http_method   = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

# CORS configuration for policies resource
resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.policies.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id      = aws_api_gateway_rest_api.api.id
  resource_id      = aws_api_gateway_resource.policies.id
  http_method      = aws_api_gateway_method.options_method.http_method
  type             = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id      = aws_api_gateway_rest_api.api.id
  resource_id      = aws_api_gateway_resource.policies.id
  http_method      = aws_api_gateway_method.options_method.http_method
  status_code      = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_integration.options_integration,
    aws_api_gateway_method_response.options_method_response
  ]
}

resource "aws_api_gateway_method_response" "options_method_response" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.policies.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# API Gateway Lambda integrations
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id      = aws_api_gateway_rest_api.api.id
  resource_id      = aws_api_gateway_resource.policies.id
  http_method      = aws_api_gateway_method.any_method.http_method
  type             = "AWS_PROXY"
  integration_http_method = "POST"
  uri              = aws_lambda_function.policy_generator.invoke_arn
}

resource "aws_api_gateway_integration" "lambda_proxy_integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.policies_proxy.id
  http_method             = aws_api_gateway_method.proxy_any_method.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.policy_generator.invoke_arn

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_integration.lambda_proxy_integration,
  ]
}

# API Gateway stage
resource "aws_api_gateway_stage" "api_stage" {
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.environment

  tags = {
    Environment = var.environment
    Application = "iam-policy-generator"
  }
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.policy_generator.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}
