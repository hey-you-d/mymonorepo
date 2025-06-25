import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";
import { missingParamErrorMessage, notOkErrorMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | BFF | create-row.ts";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST" :
            try {
                const { title, detail } : { title: string, detail: string } = req.body;
                if (!title || title.trim().length < 1) return res.status(400).json({ 
                    error: await missingParamErrorMessage(fnSignature, "POST", "Title is required"), 
                });
                if (!detail || detail.trim().length < 1) return res.status(400).json({ 
                    error: await missingParamErrorMessage(fnSignature, "POST", "Detail is required"),  
                });  

                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/create-row`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                    body: JSON.stringify({
                        title,
                        detail
                    }),
                });

                if (!response.ok) {
                    const errorMsg = await notOkErrorMessage(fnSignature, "POST", response);
                    throw new Error(errorMsg);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(201).json(result);
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
