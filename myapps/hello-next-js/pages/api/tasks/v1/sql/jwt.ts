// for testing @aws-sdk/client-secrets-manager
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSecret } from '../../../../../global/awsSecretManager';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET" :
            if (!process.env.TASKS_API_JWT_SECRET_DEV_ID_DEV) {
                throw new Error("JWT secret ID is missing");
            }
            if (!process.env.AWS_REGION) {
                throw new Error("AWS Region is missing");
            }

            const secret = await getSecret(
                process.env.TASKS_API_JWT_SECRET_DEV_ID_DEV,
                process.env.AWS_REGION
            );

            return res.status(200).json(secret);
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
}
  
export default handler;
