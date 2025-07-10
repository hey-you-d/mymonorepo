aws iam put-role-policy \
  --role-name mymonorepo-app-trial-1-production-mymonore-TaskRole-RT1UYAv3PGPJ \
  --policy-name AllowParameterStoreAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ],
        "Resource": [
          "arn:aws:ssm:us-east-1:120569641426:parameter/prod/tasks/bff/*",
          "arn:aws:ssm:us-east-1:120569641426:parameter/dev/tasks/bff/*",
          "arn:aws:ssm:us-east-1:120569641426:parameter/supabase/db/password"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue"
        ],
        "Resource": [
          "arn:aws:secretsmanager:us-east-1:120569641426:secret:prod/hello-next-js/jwt-secret-*",
          "arn:aws:secretsmanager:us-east-1:120569641426:secret:dev/hello-next-js/jwt-secret-*"
        ]
      }
    ]
  }'