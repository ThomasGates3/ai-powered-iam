variable "project_name" { type = string }
variable "environment" { type = string }
variable "lambda_function_arn" { type = string }
variable "lambda_function_name" { type = string }
variable "lambda_invoke_arn" { type = string }
variable "api_rate_limit" { type = number }
variable "cors_origins" { type = list(string) }
variable "tags" { type = map(string) }
