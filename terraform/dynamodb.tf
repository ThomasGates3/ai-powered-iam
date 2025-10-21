resource "aws_dynamodb_table" "policies" {
  name           = "iam-policies-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "policy_id"

  attribute {
    name = "policy_id"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Application = "iam-policy-generator"
  }
}
