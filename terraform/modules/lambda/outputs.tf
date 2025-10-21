output "function_arn" { value = aws_lambda_function.policy_generator.arn }
output "function_name" { value = aws_lambda_function.policy_generator.function_name }
output "invoke_arn" { value = aws_lambda_function.policy_generator.invoke_arn }
output "function_url" { value = aws_lambda_function_url.policy_generator.function_url }
