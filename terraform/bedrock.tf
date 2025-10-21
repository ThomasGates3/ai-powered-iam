# Bedrock data source to verify the model exists
data "aws_bedrock_foundation_model" "claude_sonnet" {
  model_id = var.bedrock_model_id
}

# Output model information for reference
output "bedrock_model_info" {
  value = {
    model_id   = data.aws_bedrock_foundation_model.claude_sonnet.model_id
    model_name = data.aws_bedrock_foundation_model.claude_sonnet.model_name
  }
  description = "Bedrock model information"
}
