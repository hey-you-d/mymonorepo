#!/bin/bash

set -e

# ✅ Set your AWS region
REGION="us-east-1"

echo "🔍 Step 1: Discovering Copilot-managed VPCs..."

copilot_vpcs=()
stack_names=$(aws cloudformation list-stacks \
  --region "$REGION" \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query "StackSummaries[?starts_with(StackName, 'copilot-')].StackName" \
  --output text)

for stack in $stack_names; do
  vpc_id=$(aws cloudformation describe-stacks \
    --region "$REGION" \
    --stack-name "$stack" \
    --query "Stacks[0].Outputs[?OutputKey=='VpcId'].OutputValue" \
    --output text)
  if [[ -n "$vpc_id" ]]; then
    copilot_vpcs+=("$vpc_id")
    echo "✅ Found Copilot VPC: $vpc_id (from stack: $stack)"
  fi
done

echo
echo "🧼 Step 2: Scanning all VPCs in region $REGION..."

all_vpcs=$(aws ec2 describe-vpcs --region "$REGION" --query 'Vpcs[*].VpcId' --output text)

for vpc_id in $all_vpcs; do
  if [[ " ${copilot_vpcs[*]} " =~ " $vpc_id " ]]; then
    echo "🔒 Skipping Copilot-managed VPC: $vpc_id"
    continue
  fi

  echo "🔍 Checking VPC: $vpc_id"

  ecs_services_found=0
  clusters=$(aws ecs list-clusters --region "$REGION" --query 'clusterArns[*]' --output text)
  for cluster in $clusters; do
    services=$(aws ecs list-services --cluster "$cluster" --region "$REGION" --query 'serviceArns[*]' --output text)
    for service in $services; do
      task_def=$(aws ecs describe-services \
        --cluster "$cluster" \
        --region "$REGION" \
        --services "$service" \
        --query "services[0].taskDefinition" \
        --output text 2>/dev/null)

      network_mode=$(aws ecs describe-task-definition \
        --task-definition "$task_def" \
        --region "$REGION" \
        --query "taskDefinition.networkMode" \
        --output text 2>/dev/null)

      if [[ "$network_mode" == "awsvpc" ]]; then
        eni_count=$(aws ec2 describe-network-interfaces \
          --region "$REGION" \
          --filters "Name=vpc-id,Values=$vpc_id" \
          --query "NetworkInterfaces[*].NetworkInterfaceId" \
          --output text | wc -w)
        if [[ "$eni_count" -gt 0 ]]; then
          ecs_services_found=1
          break 2
        fi
      fi
    done
  done

  alb_count=$(aws elbv2 describe-load-balancers \
    --region "$REGION" \
    --query "LoadBalancers[?VpcId=='$vpc_id'].LoadBalancerArn" \
    --output text | wc -w)

  if [[ "$ecs_services_found" -eq 0 && "$alb_count" -eq 0 ]]; then
    echo "⚠️  Potential orphaned VPC: $vpc_id (no ECS services or ALBs)"
  else
    echo "✅ VPC in use: $vpc_id"
  fi

  echo "----------------------------"
done