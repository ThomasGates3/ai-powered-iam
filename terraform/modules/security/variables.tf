variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "bedrock_model_id" {
  type = string
}

variable "region" {
  type = string
}

variable "tags" {
  type = map(string)
}
