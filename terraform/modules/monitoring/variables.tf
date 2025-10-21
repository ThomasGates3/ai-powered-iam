variable "project_name" { type = string }
variable "environment" { type = string }
variable "lambda_function_name" { type = string }
variable "log_retention_days" { type = number }
variable "tags" { type = map(string) }
