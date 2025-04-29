import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch(req.method) {
    case "GET" :
        const getResult = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
        if (!getResult.rows.length) return res.status(404).json({ error: 'Task not found' });
        
        return res.status(200).json(getResult.rows[0]);
    case "PUT" :
        const { title } = req.body;
        const putResult = await db.query(
            'UPDATE tasks SET title = $1 WHERE id = $2 RETURNING *',
            [title, id]
        );
        if (!putResult.rows.length) return res.status(404).json({ error: 'Task not found' });
        
        return res.status(200).json(putResult.rows[0]);
    case "DELETE" :
        const delResult = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (!delResult.rows.length) return res.status(404).json({ error: 'Task not found' });
        
        return res.status(204).end();
    default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);              
  }
}
