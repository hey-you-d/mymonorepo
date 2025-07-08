import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | API | db-health.ts";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
      case "GET" :
        try {
          const result = await db.isHealthy();
        
          res.status(200).json({ healthy: result });
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "GET", error as Error);
          return res.status(500).json({ healthy: false, error: errorMsg });
        }  
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
