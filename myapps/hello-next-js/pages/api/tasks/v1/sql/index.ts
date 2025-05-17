import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db/db_postgreSQL';
import { CHECK_BFF_AUTHORIZATION } from '@/lib/app/common';

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *            type: integer
 *         title:
 *            type: string
 *         detail:
 *            type: string
 *         completed:
 *            type: boolean
 *         created_at:
 *            type: string
 *            format: date-time
 * /api/tasks/v1/sql:
 *   get:
 *     summary: Get all tasks from the DB
 *     tags:
 *       - Tasks
 *     responses:
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
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       400:
 *         description: title is required
 *       500:
 *         description: database error
 *       201:
 *         description: The newly created Task item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    await CHECK_BFF_AUTHORIZATION(req, res);

    switch (req.method) {
      case "GET" :
        try {
          const { rows } = await db.query('SELECT * FROM tasks ORDER BY id DESC');
        
          return res.status(200).json(rows);
        } catch (err) {
          console.error('Database error:', err); // Log detailed error
          return res.status(500).json({ error: 'Database error' });
        } 
      case "POST" :
        try {
          const { title } = req.body;
          if (!title) return res.status(400).json({ error: 'Title is required' });

          const result = await db.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
          
          return res.status(201).json(result.rows[0]);
        } catch (err) {
          console.error('Database error:', err); // Log detailed error
          return res.status(500).json({ error: 'Database error' });
        } 
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
