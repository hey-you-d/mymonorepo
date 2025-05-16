import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/app/types/Task";
import { BASE_URL } from "../../../../../global/common";
import { TASKS_BFF_HEADER } from "../../../../../global/common";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET" :
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/jwt`, {
                    method: 'GET',
                    headers: await TASKS_BFF_HEADER(),
                });
        
                if (!response.ok) {
                    console.error(`BFF Error check JWT: ${response.status} - ${response.statusText}`);
                    // If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error check JWT: ${response.status} ${response.statusText}`);
                }
    
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch(error) {
                console.error("BFF check JWT - server error ", error ); // Log detailed error
                return res.status(500).json({ error: "BFF check JWT - server error" });
            } 
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
