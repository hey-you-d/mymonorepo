import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_API_KEY } from '@/lib/app/common';

/**
 * @swagger
 * /api/tasks/v1/sql/create-row:
 *   post:
 *     summary: Add a task into the DB
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - detail
 *             properties:
 *               title:
 *                 type: string
 *               detail:
 *                 type: string 
 *     responses:
 *       201:
 *         description: The newly created Task item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: title is required / detail is required
 *       500:
 *         description: database error
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await CHECK_API_KEY(req, res);
    if (!isAuthorized) return res.status(401).json({ error: "Unauthorized access: invalid API key" });

    switch (req.method) {
        case "POST" :
            try {
                const { title, detail } = req.body;
                if (!title) return res.status(400).json({ error: 'Title is required' });
                if (!detail) return res.status(400).json({ error: 'Detail is required' });    
                const result = await db.query(
                    `INSERT INTO tasks (title, detail) VALUES ($1, $2) RETURNING *`,
                    [title, detail]
                );
                
                return res.status(201).json(result);
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
