# Output OpenRouter model information for reference
output "openrouter_model_info" {
  value = {
    model_id   = "anthropic/claude-3.5-haiku"
    provider   = "OpenRouter"
    model_name = "Claude 3.5 Haiku"
  }
  description = "OpenRouter model information"
}
