import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER  } from "@/lib/app/common";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    switch (req.method) {
        case "GET" :
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/${id}`, {
                    method: 'GET',
                    headers: await TASKS_API_HEADER(),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                });

                if (!response.ok) {
                    console.error(`BFF Error get row for id ${id}: ${response.status} - ${response.statusText}`);
                    // For reference: If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error get row for id ${id}: ${response.status} - ${response.statusText}`);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch(err) {
                console.error(`BFF get row for id ${id} - server error`, err); // Log detailed error
                return res.status(500).json({ error: `BFF get row for id ${id} - server error` });
            }
        case "PUT" :
            const { title, detail, completed } = req.body;
            if (!title) return res.status(400).json({ error: `BFF Error updating row ${id} - Title is required` });
            if (!detail) return res.status(400).json({ error: `BFF Error updating row ${id} - Detail is required` });  
            
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/${id}`, {
                    method: 'PUT',
                    headers: await TASKS_API_HEADER(),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                    body: JSON.stringify({
                        title,
                        detail,
                        completed,
                    }),
                });

                if (!response.ok) {
                    console.error(`BFF Error update row for id ${id}: ${response.status} - ${response.statusText}`);
                    // For reference: If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error update row for id ${id}: ${response.status} ${response.statusText}`);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch(err) {
                console.error(`BFF update row for id ${id} - server error`, err); // Log detailed error
                return res.status(500).json({ error: `BFF update row for id ${id} - server error` });
            }
        case "DELETE" :
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/${id}`, {
                    method: 'DELETE',
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                    headers: await TASKS_API_HEADER(),
                });

                if (!response.ok) {
                    console.error(`BFF Error delete row for id ${id}: ${response.status} - ${response.statusText}`);
                    // For reference: If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error delete row for id ${id}: ${response.status} ${response.statusText}`);
                }
        
                return res.status(204).end();
            } catch(err) {
                console.error(`BFF delete row for id ${id} - server error`, err); // Log detailed error
                return res.status(500).json({ error: `BFF delete row for id ${id} - server error` });
            } 
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
