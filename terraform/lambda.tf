# Archive Lambda code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/../lambda_function.zip"
}

# Lambda execution role
resource "aws_iam_role" "lambda_exec_role" {
  name = "iam-policy-generator-lambda-role-${var.environment}"

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

  tags = {
    Environment = var.environment
    Application = "iam-policy-generator"
  }
}

# No Bedrock IAM policy needed - using OpenRouter API with API key

# IAM policy for Lambda - DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "lambda-dynamodb-policy"
  role = aws_iam_role.lambda_exec_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.policies.arn
      }
    ]
  })
}

# IAM policy for Lambda - CloudWatch Logs
resource "aws_iam_role_policy_attachment" "lambda_logs_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function
resource "aws_lambda_function" "policy_generator" {
  filename            = data.archive_file.lambda_zip.output_path
  function_name       = "iam-policy-generator-${var.environment}"
  role                = aws_iam_role.lambda_exec_role.arn
  handler             = "index.handler"
  runtime             = "nodejs18.x"
  timeout             = var.lambda_timeout
  memory_size         = var.lambda_memory
  source_code_hash    = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      REGION               = var.aws_region
      OPENROUTER_API_KEY   = var.openrouter_api_key
      DYNAMODB_TABLE       = aws_dynamodb_table.policies.name
    }
  }

  depends_on = [
    aws_iam_role_policy.lambda_dynamodb_policy,
    aws_iam_role_policy_attachment.lambda_logs_policy
  ]

  tags = {
    Environment = var.environment
    Application = "iam-policy-generator"
  }
}
