output "lambda_execution_role_arn" {
  value = aws_iam_role.lambda_execution.arn
}

output "lambda_security_group" {
  value = aws_security_group.lambda.id
}

output "api_gateway_role_arn" {
  value = aws_iam_role.api_gateway.arn
}
