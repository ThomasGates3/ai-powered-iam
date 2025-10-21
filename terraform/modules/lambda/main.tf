data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/src/lambda_function.py"
  output_path = "${path.module}/lambda_function.zip"
}

resource "aws_lambda_function" "policy_generator" {
  filename      = data.archive_file.lambda.output_path
  function_name = var.function_name
  role          = var.execution_role_arn
  handler       = "lambda_function.handler"
  runtime       = var.runtime
  timeout       = var.timeout
  memory_size   = var.memory_size

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [var.vpc_security_group]
  }

  environment {
    variables = var.environment_variables
  }

  depends_on = [data.archive_file.lambda]

  tags = merge(
    var.tags,
    { Name = var.function_name }
  )
}

resource "aws_lambda_function_url" "policy_generator" {
  function_name          = aws_lambda_function.policy_generator.function_name
  authorization_type    = "NONE"
  cors {
    allow_origins = ["*"]
    allow_methods = ["POST", "GET"]
    allow_headers = ["Content-Type"]
  }
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 7

  tags = var.tags
}
