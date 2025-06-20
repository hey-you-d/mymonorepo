import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST" :
            try {
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/seed-table`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                });

                if (!response.ok) {
                    console.error(`BFF Error seeding tasks DB: ${response.status} - ${response.statusText}`);
                    // For reference: If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error seeding tasks DB: ${response.status} ${response.statusText}`);
                }
        
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch (err) {
                console.error("BFF seeding tasks DB - server error", err); // Log detailed error
                return res.status(500).json({ error: "BFF seeding tasks DB - server error" });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
