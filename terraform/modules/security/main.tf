data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Lambda Execution Role
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Lambda Execution Policy - CloudWatch Logs
resource "aws_iam_role_policy" "lambda_cloudwatch_logs" {
  name   = "${var.project_name}-lambda-cloudwatch-logs"
  role   = aws_iam_role.lambda_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project_name}-*"
      }
    ]
  })
}

# Lambda Execution Policy - Bedrock
resource "aws_iam_role_policy" "lambda_bedrock" {
  name   = "${var.project_name}-lambda-bedrock"
  role   = aws_iam_role.lambda_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "BedrockInvoke"
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "arn:aws:bedrock:${data.aws_region.current.name}::foundation-model/${var.bedrock_model_id}"
      }
    ]
  })
}

# Lambda Execution Policy - VPC Network Interfaces
resource "aws_iam_role_policy" "lambda_vpc" {
  name   = "${var.project_name}-lambda-vpc"
  role   = aws_iam_role.lambda_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "VPCNetworkInterfaces"
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda Security Group
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for Lambda function"
  vpc_id      = var.vpc_id

  # Outbound: Allow HTTPS to VPC endpoints only
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"] # Lambda VPC CIDR range
  }

  tags = merge(
    var.tags,
    { Name = "${var.project_name}-lambda-sg" }
  )
}

# API Gateway Role (minimal, mostly uses Lambda)
resource "aws_iam_role" "api_gateway" {
  name = "${var.project_name}-api-gateway-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# API Gateway CloudWatch Logs Policy
resource "aws_iam_role_policy" "api_gateway_logs" {
  name   = "${var.project_name}-api-gateway-logs"
  role   = aws_iam_role.api_gateway.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogDeliveryService",
          "logs:PutResourcePolicy",
          "logs:DescribeResourcePolicies",
          "logs:DescribeLogDeliveries",
          "logs:CreateLogGroup"
        ]
        Resource = "*"
      }
    ]
  })
}
