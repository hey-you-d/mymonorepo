#!/bin/bash

REGION="${1:-us-east-1}"

echo "🔍 Checking for unused ELBs in region: $REGION"

# Check Classic ELBs (ELBv1)
echo "➡️ Checking Classic ELBs..."
aws elb describe-load-balancers --region "$REGION" --query "LoadBalancerDescriptions[*].LoadBalancerName" --output text | tr '\t' '\n' | while read -r elb_name; do
  instance_count=$(aws elb describe-load-balancers --region "$REGION" --load-balancer-names "$elb_name" --query "LoadBalancerDescriptions[0].Instances | length(@)" --output text)
  listener_count=$(aws elb describe-load-balancers --region "$REGION" --load-balancer-names "$elb_name" --query "LoadBalancerDescriptions[0].ListenerDescriptions | length(@)" --output text)
  
  if [[ "$instance_count" -eq 0 && "$listener_count" -eq 0 ]]; then
    echo "⚠️  Unused Classic ELB: $elb_name"
  fi
done

# Check ELBv2 (ALB/NLB)
echo "➡️ Checking ALBs and NLBs..."
aws elbv2 describe-load-balancers --region "$REGION" --query "LoadBalancers[*].LoadBalancerArn" --output text | tr '\t' '\n' | while read -r lb_arn; do
  lb_name=$(aws elbv2 describe-load-balancers --region "$REGION" --load-balancer-arns "$lb_arn" --query "LoadBalancers[0].LoadBalancerName" --output text)
  listener_count=$(aws elbv2 describe-listeners --region "$REGION" --load-balancer-arn "$lb_arn" --query "Listeners | length(@)" --output text)
  tg_arns=$(aws elbv2 describe-target-groups --region "$REGION" --load-balancer-arn "$lb_arn" --query "TargetGroups[*].TargetGroupArn" --output text)

  has_targets=false
  for tg_arn in $tg_arns; do
    target_count=$(aws elbv2 describe-target-health --region "$REGION" --target-group-arn "$tg_arn" --query "TargetHealthDescriptions | length(@)" --output text)
    if [[ "$target_count" -gt 0 ]]; then
      has_targets=true
      break
    fi
  done

  if [[ "$listener_count" -eq 0 && "$has_targets" = false ]]; then
    echo "⚠️  Unused ELBv2 (ALB/NLB): $lb_name"
  fi
done
