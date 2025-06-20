import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";

const fnSignature = "tasks/v1 | BFF | [id].ts";
const missingParamErrorMessage = async (fnName: string, missingParamMsg: string) => {
    const errorMsg = `${fnSignature} | ${fnName} | ${missingParamMsg}`;
    console.error(errorMsg);
    return errorMsg;
}
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
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    switch (req.method) {
        case "GET" :
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/${id}`, {
                    method: 'GET',
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                });

                if (!response.ok) {
                    const errorMsg = await notOkErrorMessage(`GET id:${id}`, response);
                    throw new Error(errorMsg);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch(err) {
                const errorMsg = await catchedErrorMessage(`GET id:${id}`, err as Error);
                return res.status(500).json({ error: errorMsg });
            }
        case "PUT" :
            const { title, detail, completed } = req.body;
            if (!title || title.trim().length < 1) return res.status(400).json({ 
                error: await missingParamErrorMessage(`PUT id:${id}`, "Title is required"), 
            });
            if (!detail || detail.trim().length < 1) return res.status(400).json({ 
                error: await missingParamErrorMessage(`PUT id:${id}`, "Detail is required"), 
            });  
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/${id}`, {
                    method: 'PUT',
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                    body: JSON.stringify({
                        title,
                        detail,
                        completed,
                    }),
                });

                if (!response.ok) {
                    const errorMsg = await notOkErrorMessage(`PUT id:${id}`, response);
                    throw new Error(errorMsg);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch(err) {
                const errorMsg = await catchedErrorMessage(`PUT id:${id}`, err as Error);
                return res.status(500).json({ error: errorMsg });
            }
        case "DELETE" :
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/${id}`, {
                    method: 'DELETE',
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                });

                if (!response.ok) {
                    const errorMsg = await notOkErrorMessage(`DELETE id:${id}`, response);
                    throw new Error(errorMsg);
                }
        
                return res.status(204).end();
            } catch(err) {
                const errorMsg = await catchedErrorMessage(`DELETE id:${id}`, err as Error);
                return res.status(500).json({ error: errorMsg });
            } 
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
