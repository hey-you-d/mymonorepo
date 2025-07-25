import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { TASKS_API_HEADER, TASKS_SQL_BASE_API_URL, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";
import { notOkErrorMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | BFF | delete-rows.ts";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST" :
            // For reference: 
            // for the sake of demo, lets use POST instead of DELETE request type
            // to demonstrate its possible to use the POST request to send a DELETE request.
            try {
                const response = await fetch(`${TASKS_SQL_BASE_API_URL}/delete-rows`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorMsg = await notOkErrorMessage(fnSignature, "POST", response);
                    throw new Error(errorMsg);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch (err) {
                const errorMsg = await catchedErrorMessage(fnSignature, "POST", err as Error);
                return res.status(500).json({ error: errorMsg });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
