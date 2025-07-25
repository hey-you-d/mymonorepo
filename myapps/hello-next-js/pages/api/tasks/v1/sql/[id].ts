import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY, VERIFY_JWT_RETURN_API_RES } from '@/lib/app/common';
import { customResponseMessage, catchedErrorMessage } from '@/lib/app/error';

const fnSignature = "tasks/v1 | API | [id].ts";

/**
 * @swagger
 * /api/tasks/v1/sql/{id}:
 *   get:
 *     summary: Get a single row (row #[id]) from the DB
 *     tags:
 *       - Tasks
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task
 *         schema:
 *           type: integer
 *     responses:
 *       400:
 *         description: not found        
 *       500:
 *         description: database error
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *   delete:
 *     summary: Delete a single row (row #[id]) from the DB
 *     tags:
 *       - Tasks
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task
 *         schema:
 *           type: integer
 *     responses:
 *       400:
 *         description: not found        
 *       500:
 *         description: database error
 *       204:
 *         description: returns nothing
 *   put:
 *     summary: update a row (row #[id]) in the DB
 *     tags:
 *       - Tasks
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - detail
 *               - completed
 *             properties:
 *               title:
 *                 type: string
 *               detail:
 *                 type: string
 *               completed:
 *                 type: boolean                     
 *     responses:
 *       404:
 *         description: not found
 *       500:
 *         description: database error
 *       200:
 *         description: The newly created Task item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ 
      error: await customResponseMessage(fnSignature, "handler", "Unauthorized access: invalid API key"),
    });

    await VERIFY_JWT_RETURN_API_RES(req, res);

    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const numericId = parseInt(id || '', 10);
    if (isNaN(numericId)) return res.status(400).json({ error: 'Invalid ID' });

    switch(req.method) {
        case "GET" :
            try {
                const getResult = await db.query('SELECT * FROM tasks WHERE id = $1', [numericId]);
                if (getResult.rows.length == 0) return res.status(404).json({ error: 'Task not found' });
                
                return res.status(200).json(getResult.rows[0]);
            } catch (error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "GET", error as Error);
                return res.status(500).json({ error: errorMsg });
            }
        case "PUT" :
            try {
                const { title, detail, completed } = req.body;
                const putResult = await db.query(
                    'UPDATE tasks SET title = $1, detail = $2, completed = $3 WHERE id = $4 RETURNING *',
                    [title, detail, completed, numericId]
                );
                if (putResult.rows.length == 0) return res.status(404).json({ error: 'Task not found' });
                
                return res.status(200).json(putResult.rows[0]);
            } catch (error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "PUT", error as Error);
                return res.status(500).json({ error: errorMsg });
            }    
        case "DELETE" :
            try {
                const delResult = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [numericId]);
                if (delResult.rows.length == 0) return res.status(404).json({ error: 'Task not found' });
                
                //return res.status(204).end();
                return res.status(200).json(delResult.rows[0]);
            } catch (error) {
                const errorMsg = await catchedErrorMessage(fnSignature, "DELETE", error as Error);
                return res.status(500).json({ error: errorMsg });
            }         
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);              
    }
}
