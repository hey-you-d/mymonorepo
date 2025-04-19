#!/bin/bash

echo "🔍 Gathering all task definitions..."
aws ecs list-task-definitions --query "taskDefinitionArns[]" --output text | tr '\t' '\n' | sort > all.txt

echo "📦 Finding all task definitions in use by services and tasks..."
> used.txt

for cluster in $(aws ecs list-clusters --query "clusterArns[]" --output text); do
  echo "➡️ Checking cluster: $cluster"

  # Services
  for service_arn in $(aws ecs list-services --cluster "$cluster" --query "serviceArns[]" --output text); do
    td=$(aws ecs describe-services --cluster "$cluster" --services "$service_arn" \
      --query "services[].taskDefinition" --output text)
    echo "$td" >> used.txt
  done

  # Running tasks
  for task_arn in $(aws ecs list-tasks --cluster "$cluster" --query "taskArns[]" --output text); do
    if [ -n "$task_arn" ]; then
      td=$(aws ecs describe-tasks --cluster "$cluster" --tasks "$task_arn" \
        --query "tasks[].taskDefinitionArn" --output text)
      echo "$td" >> used.txt
    fi
  done
done

sort used.txt | uniq > used-clean.txt

echo "🧹 Finding orphaned task definitions..."
comm -23 all.txt used-clean.txt > orphaned-task-definitions.txt

echo "✅ Done. Orphaned task definitions saved in: orphaned-task-definitions.txt"
