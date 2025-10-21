output "api_endpoint" {
  value = "${aws_api_gateway_stage.main.invoke_url}/generate-policy"
}

output "api_key" {
  value     = aws_api_gateway_api_key.main.value
  sensitive = true
}

output "rest_api_id" {
  value = aws_api_gateway_rest_api.main.id
}
