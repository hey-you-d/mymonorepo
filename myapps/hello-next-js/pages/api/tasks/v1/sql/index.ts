import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
      case "GET" :
        const { rows } = await db.query('SELECT * FROM tasks ORDER BY id DESC');
        
        return res.status(200).json(rows);
      case "POST" :
        const { title } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const result = await db.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
        
        return res.status(201).json(result.rows[0]);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);      
    }
  }
  
export default handler;
