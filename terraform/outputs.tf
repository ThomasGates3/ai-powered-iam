output "s3_website_url" {
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
  description = "S3 static website endpoint URL"
}

output "api_gateway_endpoint" {
  value       = aws_api_gateway_stage.api_stage.invoke_url
  description = "API Gateway endpoint URL"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.website.id
  description = "S3 bucket name for website hosting"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.policies.name
  description = "DynamoDB table name for policies"
}

output "lambda_function_name" {
  value       = aws_lambda_function.policy_generator.function_name
  description = "Lambda function name"
}

output "deployment_info" {
  value = {
    environment   = var.environment
    region        = var.aws_region
    website_url   = "http://${aws_s3_bucket_website_configuration.website.website_endpoint}"
    api_endpoint  = aws_api_gateway_stage.api_stage.invoke_url
    ai_provider   = "OpenRouter"
    model         = "Claude 3.5 Haiku"
  }
  description = "Deployment information"
}

output "openrouter_model_info" {
  value = {
    model_id   = "anthropic/claude-3.5-haiku"
    provider   = "OpenRouter"
    model_name = "Claude 3.5 Haiku"
  }
  description = "OpenRouter model information"
}
