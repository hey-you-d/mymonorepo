aws route53 list-hosted-zones --query "HostedZones[*].Id" --output text | tr '\t' '\n' | while read -r zone_id; do
  aws route53 list-resource-record-sets --hosted-zone-id "$zone_id" --query "ResourceRecordSets[*].{Name:Name,Value:ResourceRecords[*].Value}" --output text
done | grep "elb.amazonaws.com"
