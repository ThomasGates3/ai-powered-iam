resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-api"
  description = "IAM Policy Generator API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.tags
}

resource "aws_api_gateway_resource" "generate_policy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "generate-policy"
}

resource "aws_api_gateway_method" "post" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.generate_policy.id
  http_method      = "POST"
  authorization    = "AWS_IAM"
  api_key_required = false
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id      = aws_api_gateway_rest_api.main.id
  resource_id      = aws_api_gateway_resource.generate_policy.id
  http_method      = aws_api_gateway_method.post.http_method
  type             = "AWS_PROXY"
  integration_http_method = "POST"
  uri              = var.lambda_invoke_arn
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = var.project_name

  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_lambda_permission.api_gateway
  ]
}

resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.project_name
}

resource "aws_api_gateway_api_key" "main" {
  name        = "${var.project_name}-api-key"
  enabled     = true
  description = "API key for IAM Policy Generator"

  tags = var.tags
}
