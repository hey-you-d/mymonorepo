// for reference: don't call this on client-side, only expose secrets on the server-side
// dev note 2: SSM Parameter Store offers free tier as opposed to the Secret Manager
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// for reference: can only be called on server-side only
// for reference: AWS credentials need to be set up first in .env / .env local:
// AWS_SECRET_KEY_ID , AWS_SECRET_ACCESS_KEY & AWS_REGION
export const getSecret = async (secretId: string) => { 
    const client = new SSMClient({ region: process.env.AWS_REGION });
    const command = new GetParameterCommand({
        Name: secretId,
        WithDecryption: true,
    });

    const response = await client.send(command);

    return response.Parameter?.Value;
}
