output "cloudfront_distribution_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "CloudFront distribution domain name (Frontend URL)"
}

output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "Full CloudFront URL for the frontend application"
}

output "api_gateway_endpoint" {
  value       = aws_api_gateway_stage.api_stage.invoke_url
  description = "API Gateway endpoint URL"
}

output "s3_bucket_name" {
  value       = aws_s3_bucket.frontend.id
  description = "S3 bucket name for frontend hosting"
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
    environment           = var.environment
    region               = var.aws_region
    frontend_url         = "https://${aws_cloudfront_distribution.frontend.domain_name}"
    api_endpoint         = aws_api_gateway_stage.api_stage.invoke_url
    bedrock_model        = var.bedrock_model_id
  }
  description = "Deployment information"
}
