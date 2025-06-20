import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";

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
                    console.error(`BFF Error deleting all rows: ${response.status} - ${response.statusText}`);
                    // For reference: If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error deleting all rows: ${response.status} ${response.statusText}`);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch (err) {
                console.error("BFF deleting all rows - server error", err); // Log detailed error
                return res.status(500).json({ error: "BFF deleting all rows - server error" });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
