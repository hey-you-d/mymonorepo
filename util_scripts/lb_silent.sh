#!/bin/bash

REGION="${1:-us-east-1}"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
START=$(date -u -d "-3 days" +"%Y-%m-%dT%H:%M:%SZ")

echo "🔎 Scanning for quiet ELBs in region: $REGION"
echo "Time range: $START to $NOW"

load_balancers=$(aws elbv2 describe-load-balancers --region "$REGION" --query "LoadBalancers[*]" --output json)

echo "$load_balancers" | jq -c '.[]' | while read -r lb; do
  lb_arn=$(echo "$lb" | jq -r '.LoadBalancerArn')
  lb_name=$(echo "$lb" | jq -r '.LoadBalancerName')
  lb_dns=$(echo "$lb" | jq -r '.DNSName')
  lb_type=$(echo "$lb" | jq -r '.Type')

  echo "🔍 Checking $lb_type: $lb_name ($lb_dns)"

  # 1. Check if ALB/NLB has any listeners
  listener_count=$(aws elbv2 describe-listeners --region "$REGION" --load-balancer-arn "$lb_arn" --query "Listeners | length(@)" --output text)

  # 2. Check if there’s traffic (Sum of RequestCount)
  request_sum=$(aws cloudwatch get-metric-statistics \
    --namespace "AWS/ApplicationELB" \
    --metric-name "RequestCount" \
    --dimensions Name=LoadBalancer,Value="$lb_arn" \
    --start-time "$START" \
    --end-time "$NOW" \
    --period 86400 \
    --statistics Sum \
    --region "$REGION" \
    --query "Datapoints[0].Sum" \
    --output text 2>/dev/null)

  # 3. Check for ECS association
  ecs_associated=""
  for cluster in $(aws ecs list-clusters --region "$REGION" --query "clusterArns[]" --output text); do
    services=$(aws ecs list-services --cluster "$cluster" --region "$REGION" --query "serviceArns[]" --output text)
    for svc in $services; do
        linked_lb=$(aws ecs describe-services --cluster "$cluster" --services "$svc" --region "$REGION" \
        --query "services[].loadBalancers[].LoadBalancerName" --output text)
        if [[ "$linked_lb" == "$lb_name" ]]; then
        ecs_associated="true"
        break 2
        fi
    done
  done


  # Flag if no traffic and no ECS association
  if [[ "$listener_count" -gt 0 && -z "$request_sum" && -z "$ecs_associated" ]]; then
    echo "⚠️ Silent Load Balancer (no ECS, no traffic): $lb_name [$lb_type] - $lb_dns"
  fi
done
