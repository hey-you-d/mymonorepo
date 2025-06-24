/*
Use TRUNCATE when:
    You don't care about triggers
    You're clearing all data for real
Use DELETE when:
    You want to respect triggers or foreign key constraints
    You may want to conditionally delete (e.g., WHERE status = 'done')
*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY, VERIFY_JWT_RETURN_API_RES } from '@/lib/app/common';

const fnSignature = "tasks/v1 | API | delete-rows.ts";
const customResponseMessage = async (fnName: string, customMsg: string) => {
    const msg = `${fnSignature} | ${fnName} | ${customMsg}`;
    console.log(msg);
    return msg;
}
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

/**
 * @swagger
 * /api/tasks/v1/sql/delete-rows:
 *   post:
 *     summary: delete all rows in the database 
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: an empty array 
 *       500:
 *         description: database error
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ 
      error: await customResponseMessage("handler", "Unauthorized access: invalid API key"),
    });

    await VERIFY_JWT_RETURN_API_RES(req, res);
    
    switch (req.method) {
        // for the sake of demo, lets use POST instead of DELETE request type
        // to demonstrate its possible to use the POST request to send a DELETE request.
        case "POST" :
            try {
                const result = await db.query('DELETE FROM tasks');
        
                return res.status(200).json(result.rows);
            } catch (error) {
                const errorMsg = await catchedErrorMessage("POST", error as Error);
                return res.status(500).json({ error: errorMsg });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}

export default handler;
