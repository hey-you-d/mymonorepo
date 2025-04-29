import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/bff/tasks/db_postgreSQL';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const numericId = parseInt(id || '', 10);
    if (isNaN(numericId)) return res.status(400).json({ error: 'Invalid ID' });

    switch(req.method) {
        case "GET" :
            try {
                const getResult = await db.query('SELECT * FROM tasks WHERE id = $1', [numericId]);
                if (!getResult.rows.length) return res.status(404).json({ error: 'Task not found' });
                
                return res.status(200).json(getResult.rows[0]);
            } catch (err) {
                return res.status(500).json({ error: 'Database error' });
            }
        case "PUT" :
            try {
                const { title, detail, completed } = req.body;
                const putResult = await db.query(
                    'UPDATE tasks SET title = $1, detail = $2, completed = $3 WHERE id = $4 RETURNING *',
                    [title, detail, completed, numericId]
                );
                if (!putResult.rows.length) return res.status(404).json({ error: 'Task not found' });
                
                return res.status(200).json(putResult.rows[0]);
            } catch (err) {
                return res.status(500).json({ error: 'Database error' });
            }    
        case "DELETE" :
            try {
                const delResult = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [numericId]);
                if (!delResult.rows.length) return res.status(404).json({ error: 'Task not found' });
                
                return res.status(204).end();
            } catch (err) {
                return res.status(500).json({ error: 'Database error' });
            }         
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);              
    }
}
