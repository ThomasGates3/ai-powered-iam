output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "vpc_cidr" {
  value = aws_vpc.main.cidr_block
}

output "bedrock_endpoint_id" {
  value = aws_vpc_endpoint.bedrock.id
}

output "logs_endpoint_id" {
  value = aws_vpc_endpoint.cloudwatch_logs.id
}

output "vpc_endpoints_security_group_id" {
  value = aws_security_group.vpc_endpoints.id
}
