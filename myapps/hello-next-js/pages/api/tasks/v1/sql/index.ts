import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';

/**
 * @swagger
 * /api/tasks/v1/sql:
 *   get:
 *     summary: Get all tasks from the DB
 *     responses:
 *       200:
 *         description: A list of tasks
 *   post:
 *      summary: Add a task into the DB
 *      responses:
 *        200:
 *          description: the newly created Task item
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
