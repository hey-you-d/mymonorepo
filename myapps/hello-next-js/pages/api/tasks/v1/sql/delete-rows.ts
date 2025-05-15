/*
Use TRUNCATE when:
    You don't care about triggers
    You're clearing all data for real
Use DELETE when:
    You want to respect triggers or foreign key constraints
    You may want to conditionally delete (e.g., WHERE status = 'done')
*/

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';
import { CHECK_BFF_AUTHORIZATION } from '../../../../../global/common';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await CHECK_BFF_AUTHORIZATION(req, res);
    
    switch (req.method) {
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
        // for the sake of demo, lets use POST instead of DELETE request type
        // to demonstrate its possible to use the POST request to send a DELETE request.
        case "POST" :
            try {
                const result = await db.query('DELETE FROM tasks');
        
                return res.status(200).json(result.rows);
            } catch (err) {
                console.error('Database error:', err); // Log detailed error
                return res.status(500).json({ error: 'Database error' });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);          
    }
}

export default handler;
