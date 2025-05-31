import { SecretsManagerClient, GetSecretValueCommand, } from "@aws-sdk/client-secrets-manager";

// for reference: can only be called on server-side only
// for reference: AWS credentials need to be set up first in .env / .env local:
// AWS_SECRET_KEY_ID , AWS_SECRET_ACCESS_KEY & AWS_REGION
export const getSecret = async(secretName: string, region: string): Promise<{ jwtSecret: string }> => {
    const client = new SecretsManagerClient({
        region,
    });

    const command = new GetSecretValueCommand({ SecretId: secretName });
  
    try {
        const response = await client.send(command);
  
        if (response.SecretString) {
            return JSON.parse(response.SecretString); // if it's a JSON string
        } else {
            // For binary secrets
            const buff = Buffer.from(response.SecretBinary as unknown as string, 'base64');
            return buff.toString('ascii') as unknown as { jwtSecret: string };
        }
    } catch (err) {
        // for reference: for a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        console.error("Failed to retrieve secret from the secret manager:", err);
        throw err;
    }
}
