import type { NextApiRequest, NextApiResponse } from 'next';
import { DOMAIN_URL, TASKS_API_HEADER, getJWTFrmHttpOnlyCookie } from "@/lib/app/common";

export const config = {
    api: {
        bodyParser: true, // for reference: GraphQL body is JSON
    },
};

const fnSignature = "tasks/v1 | BFF | graphql.ts";
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
    switch (req.method) {
        case "POST" :
            try {
                const { query, variables } = req.body;
                if (!query) return res.status(400).json({ 
                    error: await missingParamErrorMessage("POST", "GraphQL query is required"),
                });
                if (!variables) return res.status(400).json({ 
                    error: await missingParamErrorMessage("POST", "GraphQL variable is required"), 
                });  

                // for reference:
                // The GraphQL handler is registered under: /api/tasks/v1/sql/graphql
                // and and Next.js API routes are not automatically prefixed with your basePath (like /hello-next-js) — that's 
                // only used for page routes and static assets, not API routes.
                const proxyResponse = await fetch(`${DOMAIN_URL}/api/tasks/v1/sql/graphql`, { // V - correct
                //const proxyResponse = await fetch(`${BASE_URL}/api/tasks/v1/sql/graphql`, {  // X - wrong
                    method: 'POST',
                    headers: await TASKS_API_HEADER(await getJWTFrmHttpOnlyCookie(req)),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                    body: JSON.stringify({
                        query,
                        variables
                    }),
                });
                
                if (!proxyResponse.ok) {
                    const errorMsg = await notOkErrorMessage("POST", proxyResponse);
                    throw new Error(errorMsg);
                }

                // for reference:
                // const rawBody = await proxyResponse.text(); // receive entire raw body
                // res.status(proxyResponse.status).send(rawBody);
                // -> you're Not parsing the data yourself. 
                // -> Forwarding everything, including potential errors, non-JSON responses, etc.
                // -> This is safest if you're not sure if the response is always JSON.
                // -> It preserves the original response as-is — headers, structure, and format.
                // const json = await proxyResponse.json(); // parse JSON
                // return res.status(200).json(json);       // re-wrap and send    
                // -> You know the response is JSON
                // -> You want to inspect, manipulate, or sanitize it before returning
                // -> but this approach adds overhead
                // -> Can throw if the body isn’t valid JSON
                // -> Might unintentionally alter the structure (e.g., lose GraphQL error fields)    

                /*
                const result:Task[] = await proxyResponse.json();
                return res.status(200).json(result);
                */

                const contentType = proxyResponse.headers.get('content-type');
                const rawBody = await proxyResponse.text(); // await this fully

                res.status(proxyResponse.status);

                if (contentType?.includes('application/json')) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(rawBody); // for reference: forward raw response
                } else {
                    res.send(rawBody); // for reference: fallback: text/plain, etc.
                }
            } catch (err) {
                const errorMsg = await catchedErrorMessage("POST", err as Error);
                return res.status(500).json({ error: errorMsg });
            }
            
            break;
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}
  
export default handler;
