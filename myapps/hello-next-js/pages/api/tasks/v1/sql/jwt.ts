// for testing @aws-sdk/client-secrets-manager
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSecret } from '@/lib/app/awsSecretManager';
import { CHECK_API_KEY } from '@/lib/app/common';  

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ error: "Unauthorized access: invalid API key" });

    switch (req.method) {
        case "GET" :
            // GET request: obtain a JWT secret
            if (!process.env.AWS_REGION) {
                throw new Error("AWS Region is missing");
            }

            const jwtSecret = await getSecret(
                "dev/hello-next-js/jwt-secret", // or prod/hello-next-js/jwt-secret - they are stored in AWS Secret Manager
                process.env.AWS_REGION
            );

            return res.status(200).json(jwtSecret);
        case "POST" :
            // create a cookie that stores newly generated JWT after the registration process
            return res.status(200).json(JSON.stringify({todo: true}));         
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
}
  
export default handler;
