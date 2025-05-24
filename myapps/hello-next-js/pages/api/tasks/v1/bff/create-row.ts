import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER } from "@/lib/app/common";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST" :
            try {
                const { title, detail } : { title: string, detail: string } = req.body;
                if (!title || title.trim().length < 1) return res.status(400).json({ error: 'BFF Error creating row - Title is required' });
                if (!detail || detail.trim().length < 1) return res.status(400).json({ error: 'BFF Error creating row - Detail is required' });  

                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/create-row`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(),
                    body: JSON.stringify({
                        title,
                        detail
                    }),
                });

                if (!response.ok) {
                    console.error(`BFF Error creating row: ${response.status} - ${response.statusText}`);
                    // For reference: If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error creating row: ${response.status} ${response.statusText}`);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(201).json(result);
            } catch (err) {
                console.error("BFF creating row - server error", err); // Log detailed error
                return res.status(500).json({ error: "BFF creating row - server error" });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
