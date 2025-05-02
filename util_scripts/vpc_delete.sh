#!/bin/bash

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "❌ Usage: $0 <vpc-id>"
  exit 1
fi

VPC_ID="$1"
REGION="${AWS_REGION:-us-east-1}"

echo "⚠️  Deleting VPC: $VPC_ID in region: $REGION"
echo "⏳ Cleaning up resources..."

# Delete NAT Gateways
nat_ids=$(aws ec2 describe-nat-gateways --region "$REGION" \
  --filter Name=vpc-id,Values="$VPC_ID" \
  --query 'NatGateways[*].NatGatewayId' --output text)

for nat in $nat_ids; do
  echo "🧹 Deleting NAT Gateway: $nat"
  aws ec2 delete-nat-gateway --nat-gateway-id "$nat" --region "$REGION"
done

# Detach and delete Internet Gateway
igw_id=$(aws ec2 describe-internet-gateways --region "$REGION" \
  --filters Name=attachment.vpc-id,Values="$VPC_ID" \
  --query "InternetGateways[0].InternetGatewayId" --output text)

if [[ -n "$igw_id" && "$igw_id" != "None" ]]; then
  echo "🧹 Detaching and deleting Internet Gateway: $igw_id"
  aws ec2 detach-internet-gateway --internet-gateway-id "$igw_id" --vpc-id "$VPC_ID" --region "$REGION"
  aws ec2 delete-internet-gateway --internet-gateway-id "$igw_id" --region "$REGION"
fi

# Delete custom route tables (excluding main)
route_table_ids=$(aws ec2 describe-route-tables --region "$REGION" \
  --filters Name=vpc-id,Values="$VPC_ID" \
  --query "RouteTables[?Associations[?Main!=\`true\`]].RouteTableId" --output text)

for rt_id in $route_table_ids; do
  echo "🧹 Deleting Route Table: $rt_id"
  aws ec2 delete-route-table --route-table-id "$rt_id" --region "$REGION"
done

# Delete subnets
subnet_ids=$(aws ec2 describe-subnets --region "$REGION" \
  --filters Name=vpc-id,Values="$VPC_ID" \
  --query "Subnets[*].SubnetId" --output text)

for subnet_id in $subnet_ids; do
  echo "🧹 Deleting Subnet: $subnet_id"
  aws ec2 delete-subnet --subnet-id "$subnet_id" --region "$REGION"
done

# Delete non-default security groups
sg_ids=$(aws ec2 describe-security-groups --region "$REGION" \
  --filters Name=vpc-id,Values="$VPC_ID" \
  --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)

for sg in $sg_ids; do
  echo "🧹 Deleting Security Group: $sg"
  aws ec2 delete-security-group --group-id "$sg" --region "$REGION"
done

# Final VPC deletion
echo "🧨 Deleting VPC: $VPC_ID"
aws ec2 delete-vpc --vpc-id "$VPC_ID" --region "$REGION"

echo "✅ Done! VPC $VPC_ID and all related resources have been deleted."