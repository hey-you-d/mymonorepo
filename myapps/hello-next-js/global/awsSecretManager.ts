import { SecretsManagerClient, GetSecretValueCommand, } from "@aws-sdk/client-secrets-manager";

// can only be called on server-side only
export const getSecret = async(secretName: string, region: string): Promise<string> => {
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
            return buff.toString('ascii');
        }
    } catch (err) {
        // for a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        console.error("Failed to retrieve secret from the secret manager:", err);
        throw err;
    }
}
