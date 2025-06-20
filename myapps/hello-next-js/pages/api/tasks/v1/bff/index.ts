// for reference:
// The goal: to avoid exposing x-api-key to the frontend (via the client-side model component). 
// Hence, implementing the "code-level" reverse-proxy approach (as opposed to the proper infra-based reverse-proxy). 
// /pages/api/tasks/v1/sql/   ← real API that talks to DB (protected by key)
// /pages/api/tasks/v1/bff/   ← safe route for frontend to hit (calls tasks/v1/sql)

// for reference #2:
// other purposes of BFF:
// - You need to aggregate data from multiple APIs.
// - You want to add custom caching, throttling, or transformations.
// - You still support a mixed environment with Client Components or CSR where secrets cannot be sent directly.
import type { NextApiRequest, NextApiResponse } from 'next';
import { Task } from "@/types/Task";
import { BASE_URL, TASKS_API_HEADER } from "@/lib/app/common";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "GET" :
            try {
                // users don't have to be logged-in in order to see the populated table, 
                // hence for this GET request action, JWT auth is unnecessary
                const response = await fetch(`${BASE_URL}/api/tasks/v1/sql/`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: await TASKS_API_HEADER(),
                });
        
                if (!response.ok) {
                    console.error(`BFF Error fetching all rows: ${response.status} - ${response.statusText}`);
                    // for reference: If the response isn't OK, throw an error to be caught in the catch block
                    throw new Error(`BFF Error fetching all rows: ${response.status} ${response.statusText}`);
                }
    
                const result:Task[] = await response.json();
    
                return res.status(200).json(result);
            } catch(error) {
                console.error("BFF Error fetching all rows - server error ", error ); // Log detailed error
                return res.status(500).json({ error: "BFF Error fetching all rows - server error" });
            } 
        case "POST" :
            // for reference: Frontend layer (client) is not using it, hence its not necessary to create one  
            res.setHeader('Allow', ['GET']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
