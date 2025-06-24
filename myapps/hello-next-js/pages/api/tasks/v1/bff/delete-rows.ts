import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";

const fnSignature = "tasks/v1 | BFF | delete-rows.ts";
const notOkErrorMessage = async (fnName: string, response: Response) => {
    const errorMsg = `${fnSignature} | ${fnName} | not ok response: ${response.status} - ${response.statusText} `;
    console.error(errorMsg);
    return errorMsg;
}
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST" :
            // For reference: 
            // for the sake of demo, lets use POST instead of DELETE request type
            // to demonstrate its possible to use the POST request to send a DELETE request.
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/delete-rows`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorMsg = await notOkErrorMessage("POST", response);
                    throw new Error(errorMsg);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch (err) {
                const errorMsg = await catchedErrorMessage("POST", err as Error);
                return res.status(500).json({ error: errorMsg });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
